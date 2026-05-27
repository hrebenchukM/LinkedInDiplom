using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Results;

namespace Notifications.Client.Contracts.Resources;

public interface INotificationResource
{
    Task<NotificationResult> CreateAsync(CreateNotificationParameters parameters);
    Task<IReadOnlyCollection<NotificationDto>> GetMyNotificationsAsync(GetMyNotificationsParameters parameters);
    Task<NotificationDto?> GetByIdAsync(GetNotificationByIdParameters parameters);
    Task<NotificationResult> MarkReadAsync(MarkNotificationReadParameters parameters);
    Task<NotificationResult> MarkAllReadAsync(MarkAllNotificationsReadParameters parameters);
    Task<NotificationResult> DeleteAsync(DeleteNotificationParameters parameters);
}
