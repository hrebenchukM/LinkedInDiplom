using Messaging.Client.Contracts.Resources;
using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;

namespace Messaging.Client.Resources;

/// <summary>
/// Resource-адаптер для чатов MessagingClient.
/// Отделяет клиентский контракт модуля от конкретной реализации core-сервиса.
/// </summary>
public class ChatResource : IChatResource
{
    private readonly IChatService _chatService;

    public ChatResource(IChatService chatService)
    {
        _chatService = chatService;
    }

    public Task<ChatResult> CreateAsync(CreateChatParameters parameters)
    {
        return _chatService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<ChatDto>> GetMyChatsAsync(GetMyChatsParameters parameters)
    {
        return _chatService.GetMyChatsAsync(parameters);
    }

    public Task<ChatDto?> GetByIdAsync(GetChatByIdParameters parameters)
    {
        return _chatService.GetByIdAsync(parameters);
    }

    public Task<ChatResult> DeleteAsync(DeleteChatParameters parameters)
    {
        return _chatService.DeleteAsync(parameters);
    }
}
