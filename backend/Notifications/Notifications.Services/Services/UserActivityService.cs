using Microsoft.EntityFrameworkCore;
using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.UserActivity;
using Notifications.Contracts.Results;
using Notifications.Contracts.Services;
using Notifications.DataAccess;
using Notifications.DataAccess.Entities;

namespace Notifications.Services.Services;

public class UserActivityService(NotificationsDbContext dbContext) : IUserActivityService
{
    public async Task<UserActivityResult> CreateAsync(CreateUserActivityParameters parameters)
    {
        var action = parameters.Action?.Trim();
        if (string.IsNullOrWhiteSpace(action))
        {
            return new UserActivityResult
            {
                Succeeded = false,
                Errors = ["Activity action is required."]
            };
        }

        var userActivity = new UserActivity
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            Action = action,
            EntityType = Normalize(parameters.EntityType),
            EntityId = parameters.EntityId,
            Meta = parameters.Meta,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.UserActivities.Add(userActivity);
        await dbContext.SaveChangesAsync();

        return new UserActivityResult
        {
            Succeeded = true,
            UserActivity = Map(userActivity)
        };
    }

    public async Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(
        GetMyUserActivityParameters parameters)
    {
        var query = dbContext.UserActivities
            .AsNoTracking()
            .Where(a => a.UserId == parameters.UserId);

        var action = Normalize(parameters.Action);
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        var limit = ResolveLimit(parameters.Limit);

        var activities = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return activities.Select(Map).ToList();
    }

    private static UserActivityDto Map(UserActivity userActivity) =>
        new()
        {
            Id = userActivity.Id,
            UserId = userActivity.UserId,
            Action = userActivity.Action,
            EntityType = userActivity.EntityType,
            EntityId = userActivity.EntityId,
            Meta = userActivity.Meta,
            CreatedAt = userActivity.CreatedAt
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
