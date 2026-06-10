using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
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

    public async Task<PagedResponse<ChatDto>> GetMyChatsAsync(
        string userId,
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _messagingClient.Chats.GetMyChatsAsync(new GetMyChatsParameters
        {
            UserId = userId,
            Skip = skip,
            Take = pageSize
        });

        var items = result.Items.Select(MapChatToFacadeDto).ToList();
        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    public async Task<ChatDto?> GetChatByIdAsync(string userId, Guid chatId)
    {
        var chat = await _messagingClient.Chats.GetByIdAsync(new GetChatByIdParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return chat == null ? null : MapChatToFacadeDto(chat);
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
