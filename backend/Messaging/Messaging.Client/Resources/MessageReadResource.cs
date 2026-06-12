using Messaging.Client.Contracts.Resources;
using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageRead;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;

namespace Messaging.Client.Resources;

public class MessageReadResource : IMessageReadResource
{
    private readonly IMessageReadService _messageReadService;

    public MessageReadResource(IMessageReadService messageReadService)
    {
        _messageReadService = messageReadService;
    }

    public Task<MessageReadResult> MarkReadAsync(MarkMessageReadParameters parameters)
    {
        return _messageReadService.MarkReadAsync(parameters);
    }

    public Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(GetMessageReadsParameters parameters)
    {
        return _messageReadService.GetMessageReadsAsync(parameters);
    }
}
