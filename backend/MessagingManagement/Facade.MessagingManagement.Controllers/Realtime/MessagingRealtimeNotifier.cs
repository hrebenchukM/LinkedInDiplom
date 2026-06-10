using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Realtime;
using Facade.MessagingManagement.Controllers.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Facade.MessagingManagement.Controllers.Realtime;

public class MessagingRealtimeNotifier : IMessagingRealtimeNotifier
{
    private readonly IHubContext<MessagingHub> _hubContext;

    public MessagingRealtimeNotifier(IHubContext<MessagingHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyMessageCreatedAsync(
        Guid chatId,
        MessageDto message,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group(MessagingHub.GetChatGroupName(chatId))
            .SendAsync("MessageCreated", message, cancellationToken);
    }

    public async Task NotifyMessageUpdatedAsync(
        Guid chatId,
        MessageDto message,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group(MessagingHub.GetChatGroupName(chatId))
            .SendAsync("MessageUpdated", message, cancellationToken);
    }

    public async Task NotifyMessageDeletedAsync(
        Guid chatId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        var payload = new MessageDeletedRealtimeDto
        {
            ChatId = chatId,
            MessageId = messageId
        };

        await _hubContext.Clients
            .Group(MessagingHub.GetChatGroupName(chatId))
            .SendAsync("MessageDeleted", payload, cancellationToken);
    }

    public async Task NotifyMessageReadAsync(
        Guid chatId,
        MessageReadDto read,
        CancellationToken cancellationToken = default)
    {
        var payload = new MessageReadRealtimeDto
        {
            ChatId = chatId,
            Id = read.Id,
            MessageId = read.MessageId,
            UserId = read.UserId,
            ReadAt = read.ReadAt
        };

        await _hubContext.Clients
            .Group(MessagingHub.GetChatGroupName(chatId))
            .SendAsync("MessageRead", payload, cancellationToken);
    }

    public async Task NotifyMessageMediaAttachedAsync(
        Guid chatId,
        MessageMediaDto media,
        CancellationToken cancellationToken = default)
    {
        var payload = new MessageMediaAttachedRealtimeDto
        {
            ChatId = chatId,
            MessageId = media.MessageId,
            Media = media
        };

        await _hubContext.Clients
            .Group(MessagingHub.GetChatGroupName(chatId))
            .SendAsync("MessageMediaAttached", payload, cancellationToken);
    }
}
