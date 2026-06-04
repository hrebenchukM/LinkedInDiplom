using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Responses;
using Messaging.Contracts.Parameters.MessageRead;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    public async Task<MessageReadResponse> MarkMessageReadAsync(string userId, Guid messageId)
    {
        var result = await _messagingClient.MessageReads.MarkReadAsync(new MarkMessageReadParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return MapMessageReadResult(result);
    }

    public async Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(string userId, Guid messageId)
    {
        var reads = await _messagingClient.MessageReads.GetMessageReadsAsync(new GetMessageReadsParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return reads.Select(MapMessageReadToFacadeDto).ToList();
    }
}
