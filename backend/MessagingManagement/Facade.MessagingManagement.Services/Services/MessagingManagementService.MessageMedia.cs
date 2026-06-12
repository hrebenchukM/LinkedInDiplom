using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Upload;
using Messaging.Contracts.Parameters.MessageMedia;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    public async Task<MessageMediaResponse> UploadMessageMediaAsync(
        string userId,
        Guid messageId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var accessResult = await _messagingClient.MessageMedia.ValidateAttachAccessAsync(
            new GetMessageMediaParameters
            {
                UserId = userId,
                MessageId = messageId
            });

        if (!accessResult.Succeeded)
        {
            return MapMessageMediaResult(accessResult);
        }

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
                    AllowedExtensions = FileUploadConstants.MessageMediaExtensions,
                    AllowedContentTypes = FileUploadConstants.MessageMediaContentTypes,
                    MaxFileSizeBytes = FileUploadConstants.DocumentMaxSizeBytes
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

        var response = MapMessageMediaResult(result);

        if (response.Success && response.MessageMedia is not null)
        {
            var message = await GetMessageByIdAsync(userId, messageId);
            if (message is not null)
            {
                await _realtimeNotifier.NotifyMessageMediaAttachedAsync(message.ChatId, response.MessageMedia);
            }
        }

        return response;
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
