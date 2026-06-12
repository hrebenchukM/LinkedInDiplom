using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Requests.UserActivity;
using Facade.NotificationsManagement.Contracts.Responses;
using Notifications.Contracts.Parameters.UserActivity;

namespace Facade.NotificationsManagement.Services.Services;

public partial class NotificationsManagementService
{
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

        return MapUserActivityResultToFacadeResponse(result);
    }

    public async Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(string userId, string? action, int? limit)
    {
        var activity = await _notificationsClient.UserActivity.GetMyActivityAsync(new GetMyUserActivityParameters
        {
            UserId = userId,
            Action = action,
            Limit = limit
        });

        return activity.Select(MapUserActivityToFacadeDto).ToList();
    }
}
