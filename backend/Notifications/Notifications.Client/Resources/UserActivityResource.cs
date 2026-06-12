using Notifications.Client.Contracts.Resources;
using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.UserActivity;
using Notifications.Contracts.Results;
using Notifications.Contracts.Services;

namespace Notifications.Client.Resources;

public class UserActivityResource : IUserActivityResource
{
    private readonly IUserActivityService _userActivityService;

    public UserActivityResource(IUserActivityService userActivityService)
    {
        _userActivityService = userActivityService;
    }

    public Task<UserActivityResult> CreateAsync(CreateUserActivityParameters parameters)
    {
        return _userActivityService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(GetMyUserActivityParameters parameters)
    {
        return _userActivityService.GetMyActivityAsync(parameters);
    }
}
