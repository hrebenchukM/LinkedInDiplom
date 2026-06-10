using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Message;
using Messaging.Contracts.Results;

namespace Messaging.Client.Contracts.Resources;

public interface IMessageResource
{
    Task<MessageResult> SendAsync(SendMessageParameters parameters);
    Task<ChatMessagesResult> GetChatMessagesAsync(GetChatMessagesParameters parameters);
    Task<MessageDto?> GetByIdAsync(GetMessageByIdParameters parameters);
    Task<MessageResult> EditAsync(EditMessageParameters parameters);
    Task<MessageResult> DeleteAsync(DeleteMessageParameters parameters);
}
