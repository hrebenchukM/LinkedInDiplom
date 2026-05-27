using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Results;

namespace Messaging.Client.Contracts.Resources;

public interface IChatResource
{
    Task<ChatResult> CreateAsync(CreateChatParameters parameters);
    Task<IReadOnlyCollection<ChatDto>> GetMyChatsAsync(GetMyChatsParameters parameters);
    Task<ChatDto?> GetByIdAsync(GetChatByIdParameters parameters);
    Task<ChatResult> DeleteAsync(DeleteChatParameters parameters);
}
