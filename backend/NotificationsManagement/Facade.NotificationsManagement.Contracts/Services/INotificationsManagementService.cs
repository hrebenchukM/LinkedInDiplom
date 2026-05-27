using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Requests.UserActivity;
using Facade.NotificationsManagement.Contracts.Responses;

namespace Facade.NotificationsManagement.Contracts.Services;

public interface INotificationsManagementService
{
    Task<IReadOnlyCollection<NotificationDto>> GetMyNotificationsAsync(string userId, bool? isRead, int? limit);
    Task<NotificationDto?> GetNotificationByIdAsync(string userId, Guid notificationId);
    Task<NotificationResponse> MarkNotificationReadAsync(string userId, Guid notificationId);
    Task<NotificationResponse> MarkAllNotificationsReadAsync(string userId);
    Task<NotificationResponse> DeleteNotificationAsync(string userId, Guid notificationId);

    Task<UserActivityResponse> CreateUserActivityAsync(string userId, CreateUserActivityRequest request);
    Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(string userId, string? action, int? limit);
}
