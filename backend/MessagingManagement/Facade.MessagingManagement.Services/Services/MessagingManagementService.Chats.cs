using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Responses;
using Messaging.Contracts.Parameters.Chat;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    public async Task<ChatResponse> CreateChatAsync(string userId, CreateChatRequest? request)
    {
        var result = await _messagingClient.Chats.CreateAsync(new CreateChatParameters
        {
            UserId = userId
        });

        return MapChatResult(result);
    }

    public async Task<IReadOnlyCollection<ChatDto>> GetMyChatsAsync(string userId)
    {
        var chats = await _messagingClient.Chats.GetMyChatsAsync(new GetMyChatsParameters
        {
            UserId = userId
        });

        return chats.Select(MapChat).ToList();
    }

    public async Task<ChatDto?> GetChatByIdAsync(string userId, Guid chatId)
    {
        var chat = await _messagingClient.Chats.GetByIdAsync(new GetChatByIdParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return chat == null ? null : MapChat(chat);
    }

    public async Task<ChatResponse> DeleteChatAsync(string userId, Guid chatId)
    {
        var result = await _messagingClient.Chats.DeleteAsync(new DeleteChatParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return MapChatResult(result);
    }
}
