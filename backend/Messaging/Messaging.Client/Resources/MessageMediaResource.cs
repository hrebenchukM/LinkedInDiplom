using Messaging.Client.Contracts.Resources;
using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageMedia;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;

namespace Messaging.Client.Resources;

public class MessageMediaResource : IMessageMediaResource
{
    private readonly IMessageMediaService _messageMediaService;

    public MessageMediaResource(IMessageMediaService messageMediaService)
    {
        _messageMediaService = messageMediaService;
    }

    public Task<MessageMediaResult> AttachAsync(AttachMessageMediaParameters parameters)
    {
        return _messageMediaService.AttachAsync(parameters);
    }

    public Task<IReadOnlyCollection<MessageMediaDto>> GetByMessageIdAsync(GetMessageMediaParameters parameters)
    {
        return _messageMediaService.GetByMessageIdAsync(parameters);
    }

    public Task<MessageMediaResult> DeleteAsync(DeleteMessageMediaParameters parameters)
    {
        return _messageMediaService.DeleteAsync(parameters);
    }
}
