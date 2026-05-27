using Messaging.Client.Contracts.Resources;
using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Message;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;

namespace Messaging.Client.Resources;

public class MessageResource : IMessageResource
{
    private readonly IMessageService _messageService;

    public MessageResource(IMessageService messageService)
    {
        _messageService = messageService;
    }

    public Task<MessageResult> SendAsync(SendMessageParameters parameters)
    {
        return _messageService.SendAsync(parameters);
    }

    public Task<IReadOnlyCollection<MessageDto>> GetChatMessagesAsync(GetChatMessagesParameters parameters)
    {
        return _messageService.GetChatMessagesAsync(parameters);
    }

    public Task<MessageDto?> GetByIdAsync(GetMessageByIdParameters parameters)
    {
        return _messageService.GetByIdAsync(parameters);
    }

    public Task<MessageResult> EditAsync(EditMessageParameters parameters)
    {
        return _messageService.EditAsync(parameters);
    }

    public Task<MessageResult> DeleteAsync(DeleteMessageParameters parameters)
    {
        return _messageService.DeleteAsync(parameters);
    }
}
