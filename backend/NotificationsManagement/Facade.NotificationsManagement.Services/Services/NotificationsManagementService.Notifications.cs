using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Requests.Notification;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
using Notifications.Contracts.Parameters.Notification;

namespace Facade.NotificationsManagement.Services.Services;

public partial class NotificationsManagementService
{
    public async Task<PagedResponse<NotificationDto>> GetMyNotificationsAsync(
        string userId,
        GetMyNotificationsQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.FromCreatedAt.HasValue
            && request.ToCreatedAt.HasValue
            && request.FromCreatedAt > request.ToCreatedAt)
        {
            throw new InvalidOperationException("FromCreatedAt must be less than or equal to ToCreatedAt.");
        }

        var (page, pageSize, skip) = request.ResolvePaging();

        var result = await _notificationsClient.Notifications.GetMyNotificationsAsync(
            new GetMyNotificationsParameters
            {
                UserId = userId,
                Skip = skip,
                Take = pageSize,
                IsRead = request.IsRead,
                Type = request.Type,
                FromCreatedAt = request.FromCreatedAt,
                ToCreatedAt = request.ToCreatedAt
            },
            cancellationToken);

        var items = result.Items
            .Select(MapNotificationToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    public async Task<NotificationDto?> GetNotificationByIdAsync(string userId, Guid notificationId)
    {
        var notification = await _notificationsClient.Notifications.GetByIdAsync(new GetNotificationByIdParameters
        {
            UserId = userId,
            NotificationId = notificationId
        });

        return notification is null ? null : MapNotificationToFacadeDto(notification);
    }

    public async Task<NotificationResponse> MarkNotificationReadAsync(string userId, Guid notificationId)
    {
        var result = await _notificationsClient.Notifications.MarkReadAsync(new MarkNotificationReadParameters
        {
            UserId = userId,
            NotificationId = notificationId
        });

        return MapNotificationResultToFacadeResponse(result);
    }

    public async Task<NotificationResponse> MarkAllNotificationsReadAsync(string userId)
    {
        var result = await _notificationsClient.Notifications.MarkAllReadAsync(new MarkAllNotificationsReadParameters
        {
            UserId = userId
        });

        return MapNotificationResultToFacadeResponse(result);
    }

    public async Task<NotificationResponse> DeleteNotificationAsync(string userId, Guid notificationId)
    {
        var result = await _notificationsClient.Notifications.DeleteAsync(new DeleteNotificationParameters
        {
            UserId = userId,
            NotificationId = notificationId
        });

        return MapNotificationResultToFacadeResponse(result);
    }
}
