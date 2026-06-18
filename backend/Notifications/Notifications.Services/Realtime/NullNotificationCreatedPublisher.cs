using Notifications.Contracts.DTOs;
using Notifications.Contracts.Realtime;

namespace Notifications.Services.Realtime;

public class NullNotificationCreatedPublisher : INotificationCreatedPublisher
{
    public Task PublishCreatedAsync(
        NotificationDto notification,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
