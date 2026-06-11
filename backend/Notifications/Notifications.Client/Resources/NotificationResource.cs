using Notifications.Client.Contracts.Resources;
using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Results;
using Notifications.Contracts.Services;

namespace Notifications.Client.Resources;

/// <summary>
/// Resource-адаптер для уведомлений NotificationsClient.
/// Поддерживает модульную границу: фасад общается с client layer, а не с DbContext.
/// </summary>
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

    public Task<NotificationsPageResult> GetMyNotificationsAsync(
        GetMyNotificationsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return _notificationService.GetMyNotificationsAsync(parameters, cancellationToken);
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
