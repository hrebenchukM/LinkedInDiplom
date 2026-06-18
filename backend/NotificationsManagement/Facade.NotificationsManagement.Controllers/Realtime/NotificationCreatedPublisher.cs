using Facade.NotificationsManagement.Contracts.Realtime;
using Microsoft.Extensions.Logging;
using Notifications.Contracts.Realtime;
using CoreNotificationDto = Notifications.Contracts.DTOs.NotificationDto;
using FacadeNotificationDto = Facade.NotificationsManagement.Contracts.DTOs.NotificationDto;

namespace Facade.NotificationsManagement.Controllers.Realtime;

public class NotificationCreatedPublisher : INotificationCreatedPublisher
{
    private readonly INotificationRealtimeNotifier _notifier;
    private readonly ILogger<NotificationCreatedPublisher> _logger;

    public NotificationCreatedPublisher(
        INotificationRealtimeNotifier notifier,
        ILogger<NotificationCreatedPublisher> logger)
    {
        _notifier = notifier;
        _logger = logger;
    }

    public async Task PublishCreatedAsync(
        CoreNotificationDto notification,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _notifier.NotifyCreatedAsync(MapToFacadeDto(notification), cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to publish realtime notification {NotificationId}.",
                notification.Id);
        }
    }

    private static FacadeNotificationDto MapToFacadeDto(CoreNotificationDto notification) =>
        new()
        {
            Id = notification.Id,
            UserId = notification.UserId,
            ActorUserId = notification.ActorUserId,
            Type = notification.Type,
            Title = notification.Title,
            Body = notification.Body,
            EntityType = notification.EntityType,
            EntityId = notification.EntityId,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            UpdatedAt = notification.UpdatedAt
        };
}
