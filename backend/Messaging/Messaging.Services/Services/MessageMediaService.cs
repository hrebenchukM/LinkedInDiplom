using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageMedia;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Messaging.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Messaging.Services.Services;

public class MessageMediaService : IMessageMediaService
{
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image",
        "video",
        "document"
    };

    private readonly MessagingDbContext _dbContext;

    public MessageMediaService(MessagingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MessageMediaResult> ValidateAttachAccessAsync(GetMessageMediaParameters parameters)
    {
        var accessError = await GetAttachAccessErrorAsync(parameters.UserId, parameters.MessageId);
        if (accessError != null)
        {
            return accessError;
        }

        return new MessageMediaResult
        {
            Succeeded = true
        };
    }

    public async Task<MessageMediaResult> AttachAsync(AttachMessageMediaParameters parameters)
    {
        var mediaUrl = parameters.MediaUrl.Trim();
        var mediaType = parameters.MediaType.Trim();

        if (string.IsNullOrWhiteSpace(mediaUrl))
        {
            return Error("Media url is required.");
        }

        if (string.IsNullOrWhiteSpace(mediaType))
        {
            return Error("Media type is required.");
        }

        if (!AllowedTypes.Contains(mediaType))
        {
            return Error("Unsupported media type.");
        }

        var accessError = await GetAttachAccessErrorAsync(parameters.UserId, parameters.MessageId);
        if (accessError != null)
        {
            return accessError;
        }

        var media = new MessageMedia
        {
            Id = Guid.NewGuid(),
            MessageId = parameters.MessageId,
            MediaUrl = mediaUrl,
            MediaType = mediaType.ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.MessageMedia.Add(media);
        await _dbContext.SaveChangesAsync();

        return new MessageMediaResult
        {
            Succeeded = true,
            MessageMedia = Map(media)
        };
    }

    public async Task<IReadOnlyCollection<MessageMediaDto>> GetByMessageIdAsync(GetMessageMediaParameters parameters)
    {
        var message = await _dbContext.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.DeletedAt == null);

        if (message == null || !await HasActiveChatAccess(message.ChatId, parameters.UserId))
        {
            return Array.Empty<MessageMediaDto>();
        }

        return await _dbContext.MessageMedia
            .AsNoTracking()
            .Where(mm => mm.MessageId == parameters.MessageId)
            .OrderByDescending(mm => mm.CreatedAt)
            .Select(mm => Map(mm))
            .ToListAsync();
    }

    public async Task<MessageMediaResult> DeleteAsync(DeleteMessageMediaParameters parameters)
    {
        var message = await _dbContext.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.Id == parameters.MessageId &&
                m.DeletedAt == null &&
                m.SenderId == parameters.UserId);

        if (message == null)
        {
            return Error("Message media not found.");
        }

        var media = await _dbContext.MessageMedia
            .FirstOrDefaultAsync(mm =>
                mm.Id == parameters.MessageMediaId &&
                mm.MessageId == parameters.MessageId);

        if (media == null)
        {
            return Error("Message media not found.");
        }

        _dbContext.MessageMedia.Remove(media);
        await _dbContext.SaveChangesAsync();

        return new MessageMediaResult
        {
            Succeeded = true,
            MessageMedia = Map(media)
        };
    }

    private async Task<MessageMediaResult?> GetAttachAccessErrorAsync(string userId, Guid messageId)
    {
        var message = await _dbContext.Messages
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.Id == messageId &&
                m.DeletedAt == null);

        if (message == null
            || message.SenderId != userId
            || !await HasActiveChatAccess(message.ChatId, userId))
        {
            return Error("Message not found.");
        }

        return null;
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

    private static MessageMediaDto Map(MessageMedia media)
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

    private static MessageMediaResult Error(string message)
    {
        return new MessageMediaResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }
}
