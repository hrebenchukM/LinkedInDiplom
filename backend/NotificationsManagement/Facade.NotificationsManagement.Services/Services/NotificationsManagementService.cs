using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Notifications.Client.Contracts;
using NotificationsNotificationDto = Notifications.Contracts.DTOs.NotificationDto;
using NotificationsUserActivityDto = Notifications.Contracts.DTOs.UserActivityDto;
using NotificationsNotificationResult = Notifications.Contracts.Results.NotificationResult;
using NotificationsUserActivityResult = Notifications.Contracts.Results.UserActivityResult;

namespace Facade.NotificationsManagement.Services.Services;

public partial class NotificationsManagementService : INotificationsManagementService
{
    private readonly INotificationsClient _notificationsClient;

    public NotificationsManagementService(INotificationsClient notificationsClient)
    {
        _notificationsClient = notificationsClient;
    }


    private static NotificationResponse MapNotificationResultToFacadeResponse(NotificationsNotificationResult result)
    {
        return new NotificationResponse
        {
            Success = result.Succeeded,
            Notification = result.Notification is null ? null : MapNotificationToFacadeDto(result.Notification),
            Errors = result.Errors
        };
    }

    private static UserActivityResponse MapUserActivityResultToFacadeResponse(NotificationsUserActivityResult result)
    {
        return new UserActivityResponse
        {
            Success = result.Succeeded,
            UserActivity = result.UserActivity is null ? null : MapUserActivityToFacadeDto(result.UserActivity),
            Errors = result.Errors
        };
    }

    private static NotificationDto MapNotificationToFacadeDto(NotificationsNotificationDto notification)
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

    private static UserActivityDto MapUserActivityToFacadeDto(NotificationsUserActivityDto activity)
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
