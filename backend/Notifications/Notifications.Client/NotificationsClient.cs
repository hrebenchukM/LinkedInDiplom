using Notifications.Client.Contracts;
using Notifications.Client.Contracts.Resources;

namespace Notifications.Client;

public class NotificationsClient : INotificationsClient
{
    public INotificationResource Notifications { get; }
    public IUserActivityResource UserActivity { get; }

    public NotificationsClient(
        INotificationResource notifications,
        IUserActivityResource userActivity)
    {
        Notifications = notifications;
        UserActivity = userActivity;
    }
}
