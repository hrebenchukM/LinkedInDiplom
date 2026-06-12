using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Requests.Message;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;

namespace Facade.MessagingManagement.Contracts.Services;

public interface IMessagingManagementService
{
    Task<ChatResponse> CreateChatAsync(string userId, CreateChatRequest request);
    Task<PagedResponse<ChatDto>> GetMyChatsAsync(
        string userId,
        PagedRequest request,
        CancellationToken cancellationToken = default);
    Task<ChatDto?> GetChatByIdAsync(string userId, Guid chatId);
    Task<ChatResponse> DeleteChatAsync(string userId, Guid chatId);

    Task<ChatMemberResponse> JoinChatAsync(string userId, Guid chatId);
    Task<ChatMemberResponse> LeaveChatAsync(string userId, Guid chatId);
    Task<IReadOnlyCollection<ChatMemberDto>> GetChatMembersAsync(string userId, Guid chatId);

    Task<MessageResponse> SendMessageAsync(string userId, Guid chatId, SendMessageRequest request);
    Task<PagedResponse<MessageDto>> GetChatMessagesAsync(
        string userId,
        Guid chatId,
        PagedRequest request,
        CancellationToken cancellationToken = default);
    Task<MessageDto?> GetMessageByIdAsync(string userId, Guid messageId);
    Task<MessageResponse> EditMessageAsync(string userId, Guid messageId, EditMessageRequest request);
    Task<MessageResponse> DeleteMessageAsync(string userId, Guid messageId);

    Task<MessageReadResponse> MarkMessageReadAsync(string userId, Guid messageId);
    Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(string userId, Guid messageId);

    Task<MessageMediaResponse> AttachMessageMediaAsync(string userId, Guid messageId, AttachMessageMediaRequest request);
    Task<MessageMediaResponse> UploadMessageMediaAsync(
        string userId,
        Guid messageId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<MessageMediaDto>> GetMessageMediaAsync(string userId, Guid messageId);
    Task<MessageMediaResponse> DeleteMessageMediaAsync(string userId, Guid messageId, Guid messageMediaId);
}
