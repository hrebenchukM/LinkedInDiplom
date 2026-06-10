using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Results;

namespace Messaging.Contracts.Services;

public interface IChatService
{
    Task<ChatResult> CreateAsync(CreateChatParameters parameters);
    Task<UserChatsResult> GetMyChatsAsync(GetMyChatsParameters parameters);
    Task<ChatDto?> GetByIdAsync(GetChatByIdParameters parameters);
    Task<ChatResult> DeleteAsync(DeleteChatParameters parameters);
}
