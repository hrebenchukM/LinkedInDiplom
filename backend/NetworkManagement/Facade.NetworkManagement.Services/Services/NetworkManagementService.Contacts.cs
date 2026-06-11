using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Results;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<ContactResponse> SendContactRequestAsync(string userId, SendContactRequest request)
    {
        var result = await _networkClient.Contacts.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = userId,
            ReceiverId = request.ReceiverId
        });

        return MapContactResult(result);
    }

    public async Task<PagedResponse<ContactDto>> GetMyContactsAsync(
        string userId,
        GetMyContactsQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _networkClient.Contacts.GetMyContactsAsync(
            new GetMyContactsParameters
            {
                UserId = userId,
                Skip = skip,
                Take = pageSize,
                Status = request.Status,
                Direction = request.Direction,
                Search = request.Search,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        var items = result.Items
            .Select(MapContactToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    public async Task<ContactDto?> GetMyContactByIdAsync(string userId, Guid contactId)
    {
        var contact = await _networkClient.Contacts.GetByIdAsync(new GetContactByIdParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return contact == null ? null : MapContactToFacadeDto(contact);
    }

    public async Task<ContactResponse> AcceptContactAsync(string userId, Guid contactId)
    {
        var result = await _networkClient.Contacts.AcceptAsync(new RespondToContactParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return MapContactResult(result);
    }

    public async Task<ContactResponse> RejectContactAsync(string userId, Guid contactId)
    {
        var result = await _networkClient.Contacts.RejectAsync(new RespondToContactParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return MapContactResult(result);
    }

    public async Task<ContactResponse> DeleteMyContactAsync(string userId, Guid contactId)
    {
        var contact = await _networkClient.Contacts.GetByIdAsync(new GetContactByIdParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        if (contact == null)
        {
            return new ContactResponse
            {
                Success = false,
                Errors = new[] { "Contact not found." }
            };
        }

        ContactResult result;

        if (contact.Status == StatusPending)
        {
            result = await _networkClient.Contacts.CancelAsync(new CancelContactRequestParameters
            {
                UserId = userId,
                ContactId = contactId
            });
        }
        else if (contact.Status == StatusAccepted)
        {
            result = await _networkClient.Contacts.RemoveAsync(new RemoveContactParameters
            {
                UserId = userId,
                ContactId = contactId
            });
        }
        else
        {
            return new ContactResponse
            {
                Success = false,
                Errors = new[] { "Contact not found." }
            };
        }

        return MapContactResult(result);
    }
}
