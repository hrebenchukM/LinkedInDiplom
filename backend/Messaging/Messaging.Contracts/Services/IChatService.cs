using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Results;

namespace Messaging.Contracts.Services;

public interface IChatService
{
    Task<ChatResult> CreateAsync(CreateChatParameters parameters);
    Task<IReadOnlyCollection<ChatDto>> GetMyChatsAsync(GetMyChatsParameters parameters);
    Task<ChatDto?> GetByIdAsync(GetChatByIdParameters parameters);
    Task<ChatResult> DeleteAsync(DeleteChatParameters parameters);
}
