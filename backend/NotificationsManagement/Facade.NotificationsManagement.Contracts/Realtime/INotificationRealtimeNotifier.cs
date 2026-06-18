using Facade.NotificationsManagement.Contracts.DTOs;

namespace Facade.NotificationsManagement.Contracts.Realtime;

public interface INotificationRealtimeNotifier
{
    Task NotifyCreatedAsync(
        NotificationDto notification,
        CancellationToken cancellationToken = default);
}
