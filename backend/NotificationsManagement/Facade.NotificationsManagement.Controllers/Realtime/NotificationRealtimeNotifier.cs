using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Realtime;
using Facade.NotificationsManagement.Controllers.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Facade.NotificationsManagement.Controllers.Realtime;

public class NotificationRealtimeNotifier : INotificationRealtimeNotifier
{
    private readonly IHubContext<NotificationsHub> _hubContext;
    private readonly ILogger<NotificationRealtimeNotifier> _logger;

    public NotificationRealtimeNotifier(
        IHubContext<NotificationsHub> hubContext,
        ILogger<NotificationRealtimeNotifier> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyCreatedAsync(
        NotificationDto notification,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(notification.UserId))
        {
            return;
        }

        try
        {
            await _hubContext.Clients
                .Group(NotificationsHub.GetUserGroupName(notification.UserId))
                .SendAsync("NotificationCreated", notification, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to push NotificationCreated for notification {NotificationId} to user {UserId}.",
                notification.Id,
                notification.UserId);
        }
    }
}
