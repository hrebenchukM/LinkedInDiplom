using Microsoft.EntityFrameworkCore;
using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Results;
using Notifications.Contracts.Services;
using Notifications.DataAccess;
using NotificationEntity = Notifications.DataAccess.Entities.Notification;

namespace Notifications.Services.Services;

/// <summary>
/// Core service модуля Notifications.
/// Управляет жизненным циклом уведомлений: create/read/read-all/delete.
/// </summary>
public class NotificationService(NotificationsDbContext dbContext) : INotificationService
{
    public async Task<NotificationResult> CreateAsync(CreateNotificationParameters parameters)
    {
        var type = parameters.Type?.Trim();
        if (string.IsNullOrWhiteSpace(type))
        {
            return new NotificationResult
            {
                Succeeded = false,
                Errors = ["Notification type is required."]
            };
        }

        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new NotificationResult
            {
                Succeeded = false,
                Errors = ["Notification title is required."]
            };
        }

        var notification = new NotificationEntity
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            ActorUserId = Normalize(parameters.ActorUserId),
            Type = type,
            Title = title,
            Body = Normalize(parameters.Body),
            EntityType = Normalize(parameters.EntityType),
            EntityId = parameters.EntityId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null,
            DeletedAt = null
        };

        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();

        return new NotificationResult
        {
            Succeeded = true,
            Notification = Map(notification)
        };
    }

    public async Task<IReadOnlyCollection<NotificationDto>> GetMyNotificationsAsync(
        GetMyNotificationsParameters parameters)
    {
        var query = dbContext.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == parameters.UserId && n.DeletedAt == null);

        if (parameters.IsRead.HasValue)
            query = query.Where(n => n.IsRead == parameters.IsRead.Value);

        var limit = ResolveLimit(parameters.Limit);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return notifications.Select(Map).ToList();
    }

    public async Task<NotificationDto?> GetByIdAsync(GetNotificationByIdParameters parameters)
    {
        var notification = await dbContext.Notifications
            .AsNoTracking()
            .FirstOrDefaultAsync(n =>
                n.Id == parameters.NotificationId &&
                n.UserId == parameters.UserId &&
                n.DeletedAt == null);

        return notification is null ? null : Map(notification);
    }

    public async Task<NotificationResult> MarkReadAsync(MarkNotificationReadParameters parameters)
    {
        var notification = await dbContext.Notifications
            .FirstOrDefaultAsync(n =>
                n.Id == parameters.NotificationId &&
                n.UserId == parameters.UserId &&
                n.DeletedAt == null);

        if (notification is null)
        {
            return new NotificationResult
            {
                Succeeded = false,
                Errors = ["Notification not found."]
            };
        }

        if (notification.IsRead)
        {
            return new NotificationResult
            {
                Succeeded = true,
                Notification = Map(notification)
            };
        }

        notification.IsRead = true;
        notification.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return new NotificationResult
        {
            Succeeded = true,
            Notification = Map(notification)
        };
    }

    public async Task<NotificationResult> MarkAllReadAsync(MarkAllNotificationsReadParameters parameters)
    {
        var now = DateTime.UtcNow;

        var unreadNotifications = await dbContext.Notifications
            .Where(n =>
                n.UserId == parameters.UserId &&
                n.DeletedAt == null &&
                !n.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.UpdatedAt = now;
        }

        if (unreadNotifications.Count > 0)
            await dbContext.SaveChangesAsync();

        return new NotificationResult
        {
            Succeeded = true
        };
    }

    public async Task<NotificationResult> DeleteAsync(DeleteNotificationParameters parameters)
    {
        var notification = await dbContext.Notifications
            .FirstOrDefaultAsync(n =>
                n.Id == parameters.NotificationId &&
                n.UserId == parameters.UserId &&
                n.DeletedAt == null);

        if (notification is null)
        {
            return new NotificationResult
            {
                Succeeded = false,
                Errors = ["Notification not found."]
            };
        }

        var now = DateTime.UtcNow;
        notification.DeletedAt = now;
        notification.UpdatedAt = now;

        await dbContext.SaveChangesAsync();

        return new NotificationResult
        {
            Succeeded = true,
            Notification = Map(notification)
        };
    }

    private static NotificationDto Map(NotificationEntity notification) =>
        new()
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

    private static int ResolveLimit(int? limit)
    {
        if (!limit.HasValue || limit.Value <= 0 || limit.Value > 100)
            return 100;

        return limit.Value;
    }

    private static string? Normalize(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
