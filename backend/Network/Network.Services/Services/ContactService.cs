using Identity.Events.Contracts.Abstractions;
using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;
using Network.Events.Contracts.Events;

namespace Network.Services.Services;

/// <summary>
/// Core service модуля Network для контактов.
/// Здесь правила статусов контакта (pending/accepted/rejected/cancelled) и проверки блокировок.
/// </summary>
public class ContactService : IContactService
{
    private const string StatusPending = "pending";
    private const string StatusAccepted = "accepted";
    private const string StatusRejected = "rejected";
    private const string StatusCancelled = "cancelled";

    private readonly NetworkDbContext _dbContext;
    private readonly IDomainEventPublisher _domainEventPublisher;

    public ContactService(
        NetworkDbContext dbContext,
        IDomainEventPublisher domainEventPublisher)
    {
        _dbContext = dbContext;
        _domainEventPublisher = domainEventPublisher;
    }

    public async Task<ContactResult> SendRequestAsync(SendContactRequestParameters parameters)
    {
        if (parameters.RequesterId == parameters.ReceiverId)
        {
            return Error("You cannot send a contact request to yourself.");
        }

        if (await IsBlockedEitherDirectionAsync(parameters.RequesterId, parameters.ReceiverId))
        {
            return Error("Cannot send a contact request while a block exists.");
        }

        var reversePending = await _dbContext.Contacts
            .AnyAsync(c =>
                c.RequesterId == parameters.ReceiverId &&
                c.ReceiverId == parameters.RequesterId &&
                c.Status == StatusPending);

        if (reversePending)
        {
            return Error("A pending contact request already exists in the opposite direction.");
        }

        var existing = await _dbContext.Contacts
            .FirstOrDefaultAsync(c =>
                c.RequesterId == parameters.RequesterId &&
                c.ReceiverId == parameters.ReceiverId);

        if (existing != null)
        {
            if (existing.Status is StatusPending or StatusAccepted)
            {
                return Error("Contact request already exists.");
            }

            var now = DateTime.UtcNow;
            existing.Status = StatusPending;
            existing.RequestedAt = now;
            existing.RespondedAt = null;
            existing.StatusChangedAt = now;

            await _dbContext.SaveChangesAsync();

            await PublishContactRequestSentAsync(existing);

            return Success(existing);
        }

        var contact = new Contact
        {
            Id = Guid.NewGuid(),
            RequesterId = parameters.RequesterId,
            ReceiverId = parameters.ReceiverId,
            Status = StatusPending,
            RequestedAt = DateTime.UtcNow,
            RespondedAt = null,
            StatusChangedAt = null
        };

        _dbContext.Contacts.Add(contact);
        await _dbContext.SaveChangesAsync();

        await PublishContactRequestSentAsync(contact);

        return Success(contact);
    }

    public async Task<ContactsPageResult> GetMyContactsAsync(
        GetMyContactsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Contacts
            .AsNoTracking()
            .Where(c =>
                c.RequesterId == parameters.UserId ||
                c.ReceiverId == parameters.UserId);

        if (!string.IsNullOrWhiteSpace(parameters.Status))
        {
            var status = parameters.Status.Trim();
            query = query.Where(c => c.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Direction))
        {
            var direction = parameters.Direction.Trim().ToLowerInvariant();
            query = direction switch
            {
                "incoming" => query.Where(c => c.ReceiverId == parameters.UserId),
                "outgoing" => query.Where(c => c.RequesterId == parameters.UserId),
                "accepted" => query.Where(c => c.Status == StatusAccepted),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();
            var searchPattern = $"%{search}%";
            query = query.Where(c =>
                EF.Functions.ILike(c.RequesterId, searchPattern) ||
                EF.Functions.ILike(c.ReceiverId, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "requestedAt"
            : parameters.SortBy.Trim();
        var descending = !string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = ApplyContactSorting(query, sortBy, descending);

        var contacts = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        return new ContactsPageResult
        {
            Items = contacts.Select(MapToDto).ToList(),
            TotalCount = totalCount
        };
    }

    public async Task<ContactDto?> GetByIdAsync(GetContactByIdParameters parameters)
    {
        var contact = await _dbContext.Contacts
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.ContactId &&
                (c.RequesterId == parameters.UserId || c.ReceiverId == parameters.UserId));

        return contact == null ? null : MapToDto(contact);
    }

    public async Task<ContactResult> AcceptAsync(RespondToContactParameters parameters)
    {
        var contact = await FindContactForParticipantAsync(parameters.ContactId, parameters.UserId);

        if (contact == null)
            return NotFound();

        if (contact.ReceiverId != parameters.UserId)
            return NotFound();

        if (contact.Status != StatusPending)
            return Error("Only pending contact requests can be accepted.");

        var now = DateTime.UtcNow;
        contact.Status = StatusAccepted;
        contact.RespondedAt = now;
        contact.StatusChangedAt = now;

        await _dbContext.SaveChangesAsync();

        await PublishContactRequestAcceptedAsync(contact, now);

        return Success(contact);
    }

    public async Task<ContactResult> RejectAsync(RespondToContactParameters parameters)
    {
        var contact = await FindContactForParticipantAsync(parameters.ContactId, parameters.UserId);

        if (contact == null)
            return NotFound();

        if (contact.ReceiverId != parameters.UserId)
            return NotFound();

        if (contact.Status != StatusPending)
            return Error("Only pending contact requests can be rejected.");

        var now = DateTime.UtcNow;
        contact.Status = StatusRejected;
        contact.RespondedAt = now;
        contact.StatusChangedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(contact);
    }

    public async Task<ContactResult> CancelAsync(CancelContactRequestParameters parameters)
    {
        var contact = await FindContactForParticipantAsync(parameters.ContactId, parameters.UserId);

        if (contact == null)
            return NotFound();

        if (contact.RequesterId != parameters.UserId)
            return NotFound();

        if (contact.Status != StatusPending)
            return Error("Only pending contact requests can be cancelled.");

        var now = DateTime.UtcNow;
        contact.Status = StatusCancelled;
        contact.StatusChangedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(contact);
    }

    public async Task<ContactResult> RemoveAsync(RemoveContactParameters parameters)
    {
        var contact = await FindContactForParticipantAsync(parameters.ContactId, parameters.UserId);

        if (contact == null)
            return NotFound();

        if (contact.Status != StatusAccepted)
            return Error("Only accepted contacts can be removed.");

        var now = DateTime.UtcNow;
        contact.Status = StatusCancelled;
        contact.StatusChangedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(contact);
    }

    private async Task<Contact?> FindContactForParticipantAsync(Guid contactId, string userId)
    {
        return await _dbContext.Contacts
            .FirstOrDefaultAsync(c =>
                c.Id == contactId &&
                (c.RequesterId == userId || c.ReceiverId == userId));
    }

    private Task PublishContactRequestSentAsync(Contact contact)
    {
        return _domainEventPublisher.PublishAsync(new ContactRequestSentEvent
        {
            ContactRequestId = contact.Id,
            SenderUserId = contact.RequesterId,
            ReceiverUserId = contact.ReceiverId,
            CreatedAt = contact.RequestedAt
        });
    }

    private Task PublishContactRequestAcceptedAsync(Contact contact, DateTime acceptedAt)
    {
        return _domainEventPublisher.PublishAsync(new ContactRequestAcceptedEvent
        {
            ContactRequestId = contact.Id,
            RequesterUserId = contact.RequesterId,
            AccepterUserId = contact.ReceiverId,
            AcceptedAt = acceptedAt
        });
    }

    private async Task<bool> IsBlockedEitherDirectionAsync(string userA, string userB)
    {
        return await _dbContext.BlockedUsers
            .AnyAsync(b =>
                b.UnblockedAt == null &&
                ((b.UserId == userA && b.BlockedUserId == userB) ||
                 (b.UserId == userB && b.BlockedUserId == userA)));
    }

    private static ContactResult Success(Contact contact)
    {
        return new ContactResult
        {
            Succeeded = true,
            Contact = MapToDto(contact)
        };
    }

    private static ContactResult Error(string message)
    {
        return new ContactResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static ContactResult NotFound()
    {
        return new ContactResult
        {
            Succeeded = false,
            Errors = new[] { "Contact not found." }
        };
    }

    private static IQueryable<Contact> ApplyContactSorting(
        IQueryable<Contact> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "respondedat" when descending => query.OrderByDescending(c => c.RespondedAt),
            "respondedat" => query.OrderBy(c => c.RespondedAt),
            "statuschangedat" when descending => query.OrderByDescending(c => c.StatusChangedAt),
            "statuschangedat" => query.OrderBy(c => c.StatusChangedAt),
            "status" when descending => query.OrderByDescending(c => c.Status),
            "status" => query.OrderBy(c => c.Status),
            "requestedat" when descending => query.OrderByDescending(c => c.RequestedAt),
            "requestedat" => query.OrderBy(c => c.RequestedAt),
            _ when descending => query.OrderByDescending(c => c.RequestedAt),
            _ => query.OrderBy(c => c.RequestedAt)
        };
    }

    private static ContactDto MapToDto(Contact contact)
    {
        return new ContactDto
        {
            Id = contact.Id,
            RequesterId = contact.RequesterId,
            ReceiverId = contact.ReceiverId,
            Status = contact.Status,
            RequestedAt = contact.RequestedAt,
            RespondedAt = contact.RespondedAt,
            StatusChangedAt = contact.StatusChangedAt
        };
    }
}
