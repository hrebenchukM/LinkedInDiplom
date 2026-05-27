using Notifications.Client.Contracts.Resources;
using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Results;
using Notifications.Contracts.Services;

namespace Notifications.Client.Resources;

public class NotificationResource : INotificationResource
{
    private readonly INotificationService _notificationService;

    public NotificationResource(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public Task<NotificationResult> CreateAsync(CreateNotificationParameters parameters)
    {
        return _notificationService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<NotificationDto>> GetMyNotificationsAsync(GetMyNotificationsParameters parameters)
    {
        return _notificationService.GetMyNotificationsAsync(parameters);
    }

    public Task<NotificationDto?> GetByIdAsync(GetNotificationByIdParameters parameters)
    {
        return _notificationService.GetByIdAsync(parameters);
    }

    public Task<NotificationResult> MarkReadAsync(MarkNotificationReadParameters parameters)
    {
        return _notificationService.MarkReadAsync(parameters);
    }

    public Task<NotificationResult> MarkAllReadAsync(MarkAllNotificationsReadParameters parameters)
    {
        return _notificationService.MarkAllReadAsync(parameters);
    }

    public Task<NotificationResult> DeleteAsync(DeleteNotificationParameters parameters)
    {
        return _notificationService.DeleteAsync(parameters);
    }
}
