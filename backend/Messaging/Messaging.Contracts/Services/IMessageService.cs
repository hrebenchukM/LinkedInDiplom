using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Message;
using Messaging.Contracts.Results;

namespace Messaging.Contracts.Services;

public interface IMessageService
{
    Task<MessageResult> SendAsync(SendMessageParameters parameters);
    Task<IReadOnlyCollection<MessageDto>> GetChatMessagesAsync(GetChatMessagesParameters parameters);
    Task<MessageDto?> GetByIdAsync(GetMessageByIdParameters parameters);
    Task<MessageResult> EditAsync(EditMessageParameters parameters);
    Task<MessageResult> DeleteAsync(DeleteMessageParameters parameters);
}
