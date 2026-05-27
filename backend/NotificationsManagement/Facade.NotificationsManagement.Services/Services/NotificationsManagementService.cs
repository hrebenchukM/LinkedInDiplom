using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Requests.UserActivity;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Notifications.Client.Contracts;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Parameters.UserActivity;
using NotificationsNotificationDto = Notifications.Contracts.DTOs.NotificationDto;
using NotificationsUserActivityDto = Notifications.Contracts.DTOs.UserActivityDto;
using NotificationsNotificationResult = Notifications.Contracts.Results.NotificationResult;
using NotificationsUserActivityResult = Notifications.Contracts.Results.UserActivityResult;

namespace Facade.NotificationsManagement.Services.Services;

public class NotificationsManagementService : INotificationsManagementService
{
    private readonly INotificationsClient _notificationsClient;

    public NotificationsManagementService(INotificationsClient notificationsClient)
    {
        _notificationsClient = notificationsClient;
    }

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

    public async Task<UserActivityResponse> CreateUserActivityAsync(string userId, CreateUserActivityRequest request)
    {
        var result = await _notificationsClient.UserActivity.CreateAsync(new CreateUserActivityParameters
        {
            UserId = userId,
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Meta = request.Meta
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(string userId, string? action, int? limit)
    {
        var activity = await _notificationsClient.UserActivity.GetMyActivityAsync(new GetMyUserActivityParameters
        {
            UserId = userId,
            Action = action,
            Limit = limit
        });

        return activity.Select(Map).ToList();
    }

    private static NotificationResponse Map(NotificationsNotificationResult result)
    {
        return new NotificationResponse
        {
            Success = result.Succeeded,
            Notification = result.Notification is null ? null : Map(result.Notification),
            Errors = result.Errors
        };
    }

    private static UserActivityResponse Map(NotificationsUserActivityResult result)
    {
        return new UserActivityResponse
        {
            Success = result.Succeeded,
            UserActivity = result.UserActivity is null ? null : Map(result.UserActivity),
            Errors = result.Errors
        };
    }

    private static NotificationDto Map(NotificationsNotificationDto notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            ActorUserId = notification.ActorUserId,
            Type = notification.Type,
            Title = notification.Title,
            Body = notification.Body,
            EntityType = notification.EntityType,
            EntityId = notification.EntityId,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            UpdatedAt = notification.UpdatedAt
        };
    }

    private static UserActivityDto Map(NotificationsUserActivityDto activity)
    {
        return new UserActivityDto
        {
            Id = activity.Id,
            UserId = activity.UserId,
            Action = activity.Action,
            EntityType = activity.EntityType,
            EntityId = activity.EntityId,
            Meta = activity.Meta,
            CreatedAt = activity.CreatedAt
        };
    }
}
