using Notifications.Client.Contracts.Resources;

namespace Notifications.Client.Contracts;

public interface INotificationsClient
{
    INotificationResource Notifications { get; }
    IUserActivityResource UserActivity { get; }
}
