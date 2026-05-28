using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Messaging.Contracts.Parameters.MessageMedia;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
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

        return media.Select(MapMessageMedia).ToList();
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
}
