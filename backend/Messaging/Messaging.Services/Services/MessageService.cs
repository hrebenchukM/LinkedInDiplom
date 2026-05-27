using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Message;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Messaging.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Messaging.Services.Services;

public class MessageService : IMessageService
{
    private readonly MessagingDbContext _dbContext;

    public MessageService(MessagingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MessageResult> SendAsync(SendMessageParameters parameters)
    {
        var content = parameters.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return Error("Message content is required.");
        }

        if (!await HasActiveChatAccess(parameters.ChatId, parameters.UserId))
        {
            return Error("Chat not found.");
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ChatId = parameters.ChatId,
            SenderId = parameters.UserId,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            EditedAt = null,
            DeletedAt = null
        };

        _dbContext.Messages.Add(message);
        await _dbContext.SaveChangesAsync();

        return new MessageResult
        {
            Succeeded = true,
            Message = Map(message)
        };
    }

    public async Task<IReadOnlyCollection<MessageDto>> GetChatMessagesAsync(GetChatMessagesParameters parameters)
    {
        if (!await HasActiveChatAccess(parameters.ChatId, parameters.UserId))
        {
            return Array.Empty<MessageDto>();
        }

        var messages = await _dbContext.Messages
            .AsNoTracking()
            .Where(m => m.ChatId == parameters.ChatId && m.DeletedAt == null)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        if (messages.Count == 0)
        {
            return Array.Empty<MessageDto>();
        }

        var messageIds = messages.Select(m => m.Id).ToList();
        var mediaLookup = await _dbContext.MessageMedia
            .AsNoTracking()
            .Where(mm => messageIds.Contains(mm.MessageId))
            .OrderByDescending(mm => mm.CreatedAt)
            .ToListAsync();

        var mediaByMessage = mediaLookup
            .GroupBy(mm => mm.MessageId)
            .ToDictionary(g => g.Key, g => (IReadOnlyCollection<MessageMediaDto>)g.Select(MapMedia).ToList());

        return messages
            .Select(m =>
            {
                mediaByMessage.TryGetValue(m.Id, out var media);
                return Map(m, media);
            })
            .ToList();
    }

    public async Task<MessageDto?> GetByIdAsync(GetMessageByIdParameters parameters)
    {
        var message = await _dbContext.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.DeletedAt == null);

        if (message == null || !await HasActiveChatAccess(message.ChatId, parameters.UserId))
        {
            return null;
        }

        var media = await _dbContext.MessageMedia
            .AsNoTracking()
            .Where(mm => mm.MessageId == message.Id)
            .OrderByDescending(mm => mm.CreatedAt)
            .Select(mm => MapMedia(mm))
            .ToListAsync();

        return Map(message, media);
    }

    public async Task<MessageResult> EditAsync(EditMessageParameters parameters)
    {
        var content = parameters.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return Error("Message content is required.");
        }

        var message = await _dbContext.Messages
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.SenderId == parameters.UserId &&
                m.DeletedAt == null);

        if (message == null)
        {
            return Error("Message not found.");
        }

        message.Content = content;
        message.EditedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        var media = await _dbContext.MessageMedia
            .AsNoTracking()
            .Where(mm => mm.MessageId == message.Id)
            .OrderByDescending(mm => mm.CreatedAt)
            .Select(mm => MapMedia(mm))
            .ToListAsync();

        return new MessageResult
        {
            Succeeded = true,
            Message = Map(message, media)
        };
    }

    public async Task<MessageResult> DeleteAsync(DeleteMessageParameters parameters)
    {
        var message = await _dbContext.Messages
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.SenderId == parameters.UserId &&
                m.DeletedAt == null);

        if (message == null)
        {
            return Error("Message not found.");
        }

        var now = DateTime.UtcNow;
        message.DeletedAt = now;
        message.EditedAt = now;

        await _dbContext.SaveChangesAsync();

        return new MessageResult
        {
            Succeeded = true,
            Message = Map(message)
        };
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

    private static MessageDto Map(Message message, IReadOnlyCollection<MessageMediaDto>? media = null)
    {
        return new MessageDto
        {
            Id = message.Id,
            ChatId = message.ChatId,
            SenderId = message.SenderId,
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            EditedAt = message.EditedAt,
            Media = media
        };
    }

    private static MessageMediaDto MapMedia(MessageMedia media)
    {
        return new MessageMediaDto
        {
            Id = media.Id,
            MessageId = media.MessageId,
            MediaUrl = media.MediaUrl,
            MediaType = media.MediaType,
            CreatedAt = media.CreatedAt
        };
    }

    private static MessageResult Error(string message)
    {
        return new MessageResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }
}
