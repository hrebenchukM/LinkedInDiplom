using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Parameters.ChatMember;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    public async Task<ChatResponse> CreateChatAsync(string userId, CreateChatRequest request)
    {
        var result = await _messagingClient.Chats.CreateAsync(new CreateChatParameters
        {
            UserId = userId
        });

        if (!result.Succeeded || result.Chat == null)
        {
            return MapChatResult(result);
        }

        var participantUserId = request.ParticipantUserId?.Trim();

        if (string.IsNullOrWhiteSpace(participantUserId) ||
            string.Equals(participantUserId, userId, StringComparison.Ordinal))
        {
            return MapChatResult(result);
        }

        var joinResult = await _messagingClient.ChatMembers.JoinAsync(new JoinChatParameters
        {
            UserId = participantUserId,
            ChatId = result.Chat.Id
        });

        if (!joinResult.Succeeded)
        {
            return MapChatResult(result);
        }

        var updatedChat = await _messagingClient.Chats.GetByIdAsync(new GetChatByIdParameters
        {
            UserId = userId,
            ChatId = result.Chat.Id
        });

        if (updatedChat == null)
        {
            return MapChatResult(result);
        }

        return new ChatResponse
        {
            Success = true,
            Chat = MapChatToFacadeDto(updatedChat),
            Errors = Array.Empty<string>()
        };
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
