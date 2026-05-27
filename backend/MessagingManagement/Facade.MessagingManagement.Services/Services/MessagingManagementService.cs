using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Requests.Message;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Messaging.Client.Contracts;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Parameters.ChatMember;
using Messaging.Contracts.Parameters.Message;
using Messaging.Contracts.Parameters.MessageMedia;
using Messaging.Contracts.Parameters.MessageRead;
using MessagingChatDto = Messaging.Contracts.DTOs.ChatDto;
using MessagingChatMemberDto = Messaging.Contracts.DTOs.ChatMemberDto;
using MessagingMessageDto = Messaging.Contracts.DTOs.MessageDto;
using MessagingMessageMediaDto = Messaging.Contracts.DTOs.MessageMediaDto;
using MessagingMessageReadDto = Messaging.Contracts.DTOs.MessageReadDto;
using MessagingChatResult = Messaging.Contracts.Results.ChatResult;
using MessagingChatMemberResult = Messaging.Contracts.Results.ChatMemberResult;
using MessagingMessageResult = Messaging.Contracts.Results.MessageResult;
using MessagingMessageReadResult = Messaging.Contracts.Results.MessageReadResult;
using MessagingMessageMediaResult = Messaging.Contracts.Results.MessageMediaResult;

namespace Facade.MessagingManagement.Services.Services;

public class MessagingManagementService : IMessagingManagementService
{
    private readonly IMessagingClient _messagingClient;

    public MessagingManagementService(IMessagingClient messagingClient)
    {
        _messagingClient = messagingClient;
    }

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

    public async Task<ChatMemberResponse> JoinChatAsync(string userId, Guid chatId)
    {
        var result = await _messagingClient.ChatMembers.JoinAsync(new JoinChatParameters
        {
            UserId = userId,
            ChatId = chatId,
            Folder = null
        });

        return MapChatMemberResult(result);
    }

    public async Task<ChatMemberResponse> LeaveChatAsync(string userId, Guid chatId)
    {
        var result = await _messagingClient.ChatMembers.LeaveAsync(new LeaveChatParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return MapChatMemberResult(result);
    }

    public async Task<IReadOnlyCollection<ChatMemberDto>> GetChatMembersAsync(string userId, Guid chatId)
    {
        var members = await _messagingClient.ChatMembers.GetChatMembersAsync(new GetChatMembersParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return members.Select(MapChatMember).ToList();
    }

    public async Task<MessageResponse> SendMessageAsync(string userId, Guid chatId, SendMessageRequest request)
    {
        var result = await _messagingClient.Messages.SendAsync(new SendMessageParameters
        {
            UserId = userId,
            ChatId = chatId,
            Content = request.Content
        });

        return MapMessageResult(result);
    }

    public async Task<IReadOnlyCollection<MessageDto>> GetChatMessagesAsync(string userId, Guid chatId)
    {
        var messages = await _messagingClient.Messages.GetChatMessagesAsync(new GetChatMessagesParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return messages.Select(MapMessage).ToList();
    }

    public async Task<MessageDto?> GetMessageByIdAsync(string userId, Guid messageId)
    {
        var message = await _messagingClient.Messages.GetByIdAsync(new GetMessageByIdParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return message == null ? null : MapMessage(message);
    }

    public async Task<MessageResponse> EditMessageAsync(string userId, Guid messageId, EditMessageRequest request)
    {
        var result = await _messagingClient.Messages.EditAsync(new EditMessageParameters
        {
            UserId = userId,
            MessageId = messageId,
            Content = request.Content
        });

        return MapMessageResult(result);
    }

    public async Task<MessageResponse> DeleteMessageAsync(string userId, Guid messageId)
    {
        var result = await _messagingClient.Messages.DeleteAsync(new DeleteMessageParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return MapMessageResult(result);
    }

    public async Task<MessageReadResponse> MarkMessageReadAsync(string userId, Guid messageId)
    {
        var result = await _messagingClient.MessageReads.MarkReadAsync(new MarkMessageReadParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return MapMessageReadResult(result);
    }

    public async Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(string userId, Guid messageId)
    {
        var reads = await _messagingClient.MessageReads.GetMessageReadsAsync(new GetMessageReadsParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return reads.Select(MapMessageRead).ToList();
    }

    public async Task<MessageMediaResponse> AttachMessageMediaAsync(string userId, Guid messageId, AttachMessageMediaRequest request)
    {
        var result = await _messagingClient.MessageMedia.AttachAsync(new AttachMessageMediaParameters
        {
            UserId = userId,
            MessageId = messageId,
            MediaUrl = request.MediaUrl,
            MediaType = request.MediaType
        });

        return MapMessageMediaResult(result);
    }

    public async Task<IReadOnlyCollection<MessageMediaDto>> GetMessageMediaAsync(string userId, Guid messageId)
    {
        var media = await _messagingClient.MessageMedia.GetByMessageIdAsync(new GetMessageMediaParameters
        {
            UserId = userId,
            MessageId = messageId
        });

        return media.Select(MapMessageMedia).ToList();
    }

    public async Task<MessageMediaResponse> DeleteMessageMediaAsync(string userId, Guid messageId, Guid messageMediaId)
    {
        var result = await _messagingClient.MessageMedia.DeleteAsync(new DeleteMessageMediaParameters
        {
            UserId = userId,
            MessageId = messageId,
            MessageMediaId = messageMediaId
        });

        return MapMessageMediaResult(result);
    }

    private static ChatResponse MapChatResult(MessagingChatResult result)
    {
        return new ChatResponse
        {
            Success = result.Succeeded,
            Chat = result.Chat == null ? null : MapChat(result.Chat),
            Errors = result.Errors
        };
    }

    private static ChatMemberResponse MapChatMemberResult(MessagingChatMemberResult result)
    {
        return new ChatMemberResponse
        {
            Success = result.Succeeded,
            ChatMember = result.ChatMember == null ? null : MapChatMember(result.ChatMember),
            Errors = result.Errors
        };
    }

    private static MessageResponse MapMessageResult(MessagingMessageResult result)
    {
        return new MessageResponse
        {
            Success = result.Succeeded,
            Message = result.Message == null ? null : MapMessage(result.Message),
            Errors = result.Errors
        };
    }

    private static MessageReadResponse MapMessageReadResult(MessagingMessageReadResult result)
    {
        return new MessageReadResponse
        {
            Success = result.Succeeded,
            MessageRead = result.MessageRead == null ? null : MapMessageRead(result.MessageRead),
            Errors = result.Errors
        };
    }

    private static MessageMediaResponse MapMessageMediaResult(MessagingMessageMediaResult result)
    {
        return new MessageMediaResponse
        {
            Success = result.Succeeded,
            MessageMedia = result.MessageMedia == null ? null : MapMessageMedia(result.MessageMedia),
            Errors = result.Errors
        };
    }

    private static ChatDto MapChat(MessagingChatDto dto)
    {
        return new ChatDto
        {
            Id = dto.Id,
            CreatedBy = dto.CreatedBy,
            CreatedAt = dto.CreatedAt,
            Members = dto.Members?.Select(MapChatMember).ToList()
        };
    }

    private static ChatMemberDto MapChatMember(MessagingChatMemberDto dto)
    {
        return new ChatMemberDto
        {
            Id = dto.Id,
            ChatId = dto.ChatId,
            UserId = dto.UserId,
            Folder = dto.Folder,
            JoinedAt = dto.JoinedAt,
            LeftAt = dto.LeftAt
        };
    }

    private static MessageDto MapMessage(MessagingMessageDto dto)
    {
        return new MessageDto
        {
            Id = dto.Id,
            ChatId = dto.ChatId,
            SenderId = dto.SenderId,
            Content = dto.Content,
            CreatedAt = dto.CreatedAt,
            EditedAt = dto.EditedAt,
            Media = dto.Media?.Select(MapMessageMedia).ToList()
        };
    }

    private static MessageReadDto MapMessageRead(MessagingMessageReadDto dto)
    {
        return new MessageReadDto
        {
            Id = dto.Id,
            MessageId = dto.MessageId,
            UserId = dto.UserId,
            ReadAt = dto.ReadAt
        };
    }

    private static MessageMediaDto MapMessageMedia(MessagingMessageMediaDto dto)
    {
        return new MessageMediaDto
        {
            Id = dto.Id,
            MessageId = dto.MessageId,
            MediaUrl = dto.MediaUrl,
            MediaType = dto.MediaType,
            CreatedAt = dto.CreatedAt
        };
    }
}
