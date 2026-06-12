using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageRead;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Messaging.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Messaging.Services.Services;

public class MessageReadService : IMessageReadService
{
    private readonly MessagingDbContext _dbContext;

    public MessageReadService(MessagingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MessageReadResult> MarkReadAsync(MarkMessageReadParameters parameters)
    {
        var message = await _dbContext.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.DeletedAt == null);

        if (message == null || !await HasActiveChatAccess(message.ChatId, parameters.UserId))
        {
            return Error("Message not found.");
        }

        var existing = await _dbContext.MessageReads
            .FirstOrDefaultAsync(mr =>
                mr.MessageId == parameters.MessageId &&
                mr.UserId == parameters.UserId);

        if (existing != null)
        {
            return new MessageReadResult
            {
                Succeeded = true,
                MessageRead = Map(existing)
            };
        }

        var messageRead = new MessageRead
        {
            Id = Guid.NewGuid(),
            MessageId = parameters.MessageId,
            UserId = parameters.UserId,
            ReadAt = DateTime.UtcNow
        };

        _dbContext.MessageReads.Add(messageRead);
        await _dbContext.SaveChangesAsync();

        return new MessageReadResult
        {
            Succeeded = true,
            MessageRead = Map(messageRead)
        };
    }

    public async Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(GetMessageReadsParameters parameters)
    {
        var message = await _dbContext.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.DeletedAt == null);

        if (message == null || !await HasActiveChatAccess(message.ChatId, parameters.UserId))
        {
            return Array.Empty<MessageReadDto>();
        }

        return await _dbContext.MessageReads
            .AsNoTracking()
            .Where(mr => mr.MessageId == parameters.MessageId)
            .OrderByDescending(mr => mr.ReadAt)
            .Select(mr => Map(mr))
            .ToListAsync();
    }

    private async Task<bool> HasActiveChatAccess(Guid chatId, string userId)
    {
        return await _dbContext.Chats
            .AsNoTracking()
            .AnyAsync(c =>
                c.Id == chatId &&
                c.DeletedAt == null &&
                _dbContext.ChatMembers.Any(cm =>
                    cm.ChatId == c.Id &&
                    cm.UserId == userId &&
                    cm.LeftAt == null));
    }

    private static MessageReadDto Map(MessageRead messageRead)
    {
        return new MessageReadDto
        {
            Id = messageRead.Id,
            MessageId = messageRead.MessageId,
            UserId = messageRead.UserId,
            ReadAt = messageRead.ReadAt
        };
    }

    private static MessageReadResult Error(string message)
    {
        return new MessageReadResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }
}
