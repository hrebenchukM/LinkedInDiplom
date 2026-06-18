using Notifications.Contracts.DTOs;

namespace Notifications.Contracts.Realtime;

/// <summary>
/// Optional hook invoked after a notification is persisted.
/// Core module ships a no-op; host registers a realtime implementation.
/// </summary>
public interface INotificationCreatedPublisher
{
    Task PublishCreatedAsync(
        NotificationDto notification,
        CancellationToken cancellationToken = default);
}
