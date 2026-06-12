using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Requests.Notification;
using Facade.NotificationsManagement.Contracts.Requests.UserActivity;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;

namespace Facade.NotificationsManagement.Contracts.Services;

public interface INotificationsManagementService
{
    Task<PagedResponse<NotificationDto>> GetMyNotificationsAsync(
        string userId,
        GetMyNotificationsQueryRequest request,
        CancellationToken cancellationToken = default);
    Task<NotificationDto?> GetNotificationByIdAsync(string userId, Guid notificationId);
    Task<NotificationResponse> MarkNotificationReadAsync(string userId, Guid notificationId);
    Task<NotificationResponse> MarkAllNotificationsReadAsync(string userId);
    Task<NotificationResponse> DeleteNotificationAsync(string userId, Guid notificationId);

    Task<UserActivityResponse> CreateUserActivityAsync(string userId, CreateUserActivityRequest request);
    Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(string userId, string? action, int? limit);
}
