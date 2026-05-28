using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Message;
using Facade.MessagingManagement.Contracts.Responses;
using Messaging.Contracts.Parameters.Message;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    public async Task<MessageResponse> SendMessageAsync(string userId, Guid chatId, SendMessageRequest request)
    {
        var result = await _messagingClient.Messages.SendAsync(new SendMessageParameters
        {
            UserId = userId,
            ChatId = chatId,
            Content = request.Content
        });

        return MapMessageResult(result);
    }

    public async Task<IReadOnlyCollection<MessageDto>> GetChatMessagesAsync(string userId, Guid chatId)
    {
        var messages = await _messagingClient.Messages.GetChatMessagesAsync(new GetChatMessagesParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return messages.Select(MapMessage).ToList();
    }

    public async Task<MessageDto?> GetMessageByIdAsync(string userId, Guid messageId)
    {
        var message = await _messagingClient.Messages.GetByIdAsync(new GetMessageByIdParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return message == null ? null : MapMessage(message);
    }

    public async Task<MessageResponse> EditMessageAsync(string userId, Guid messageId, EditMessageRequest request)
    {
        var result = await _messagingClient.Messages.EditAsync(new EditMessageParameters
        {
            UserId = userId,
            MessageId = messageId,
            Content = request.Content
        });

        return MapMessageResult(result);
    }

    public async Task<MessageResponse> DeleteMessageAsync(string userId, Guid messageId)
    {
        var result = await _messagingClient.Messages.DeleteAsync(new DeleteMessageParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return MapMessageResult(result);
    }
}
