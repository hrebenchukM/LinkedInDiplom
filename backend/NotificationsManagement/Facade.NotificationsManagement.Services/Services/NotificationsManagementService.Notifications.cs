using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Responses;
using Notifications.Contracts.Parameters.Notification;

namespace Facade.NotificationsManagement.Services.Services;

public partial class NotificationsManagementService
{
    public async Task<IReadOnlyCollection<NotificationDto>> GetMyNotificationsAsync(string userId, bool? isRead, int? limit)
    {
        var notifications = await _notificationsClient.Notifications.GetMyNotificationsAsync(new GetMyNotificationsParameters
        {
            UserId = userId,
            IsRead = isRead,
            Limit = limit
        });

        return notifications.Select(Map).ToList();
    }

    public async Task<NotificationDto?> GetNotificationByIdAsync(string userId, Guid notificationId)
    {
        var notification = await _notificationsClient.Notifications.GetByIdAsync(new GetNotificationByIdParameters
        {
            UserId = userId,
            NotificationId = notificationId
        });

        return notification is null ? null : Map(notification);
    }

    public async Task<NotificationResponse> MarkNotificationReadAsync(string userId, Guid notificationId)
    {
        var result = await _notificationsClient.Notifications.MarkReadAsync(new MarkNotificationReadParameters
        {
            UserId = userId,
            NotificationId = notificationId
        });

        return Map(result);
    }

    public async Task<NotificationResponse> MarkAllNotificationsReadAsync(string userId)
    {
        var result = await _notificationsClient.Notifications.MarkAllReadAsync(new MarkAllNotificationsReadParameters
        {
            UserId = userId
        });

        return Map(result);
    }

    public async Task<NotificationResponse> DeleteNotificationAsync(string userId, Guid notificationId)
    {
        var result = await _notificationsClient.Notifications.DeleteAsync(new DeleteNotificationParameters
        {
            UserId = userId,
            NotificationId = notificationId
        });

        return Map(result);
    }
}
