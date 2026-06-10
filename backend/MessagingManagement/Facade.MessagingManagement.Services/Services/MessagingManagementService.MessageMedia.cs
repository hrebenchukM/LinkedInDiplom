using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Messaging.Contracts.Parameters.MessageMedia;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    private static readonly string[] MessageMediaExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf" };
    private static readonly string[] MessageMediaContentTypes =
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf"
    };

    public async Task<MessageMediaResponse> UploadMessageMediaAsync(
        string userId,
        Guid messageId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        string mediaUrl;

        try
        {
            mediaUrl = await _fileStorageService.SaveAsync(
                fileStream,
                fileName,
                contentType,
                new FileStoragePathOptions
                {
                    ModuleName = "messaging",
                    EntityName = "message-media",
                    OwnerId = userId,
                    EntityId = messageId.ToString(),
                    AllowedExtensions = MessageMediaExtensions,
                    AllowedContentTypes = MessageMediaContentTypes,
                    MaxFileSizeBytes = 10 * 1024 * 1024
                },
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return new MessageMediaResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }

        return await AttachMessageMediaAsync(userId, messageId, new AttachMessageMediaRequest
        {
            MediaUrl = mediaUrl,
            MediaType = ResolveMessageMediaType(contentType)
        });
    }

    public async Task<MessageMediaResponse> AttachMessageMediaAsync(string userId, Guid messageId, AttachMessageMediaRequest request)
    {
        var result = await _messagingClient.MessageMedia.AttachAsync(new AttachMessageMediaParameters
        {
            UserId = userId,
            MessageId = messageId,
            MediaUrl = request.MediaUrl,
            MediaType = request.MediaType
        });

        return MapMessageMediaResult(result);
    }

    public async Task<IReadOnlyCollection<MessageMediaDto>> GetMessageMediaAsync(string userId, Guid messageId)
    {
        var media = await _messagingClient.MessageMedia.GetByMessageIdAsync(new GetMessageMediaParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return media.Select(MapMessageMediaToFacadeDto).ToList();
    }

    public async Task<MessageMediaResponse> DeleteMessageMediaAsync(string userId, Guid messageId, Guid messageMediaId)
    {
        var result = await _messagingClient.MessageMedia.DeleteAsync(new DeleteMessageMediaParameters
        {
            UserId = userId,
            MessageId = messageId,
            MessageMediaId = messageMediaId
        });

        return MapMessageMediaResult(result);
    }

    private static string ResolveMessageMediaType(string contentType)
    {
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return "image";

        return "document";
    }
}
