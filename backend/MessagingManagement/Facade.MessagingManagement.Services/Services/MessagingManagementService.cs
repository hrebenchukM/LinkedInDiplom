using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Messaging.Client.Contracts;
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

public partial class MessagingManagementService : IMessagingManagementService
{
    private readonly IMessagingClient _messagingClient;

    public MessagingManagementService(IMessagingClient messagingClient)
    {
        _messagingClient = messagingClient;
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
