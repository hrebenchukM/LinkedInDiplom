using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.UserActivity;
using Notifications.Contracts.Results;

namespace Notifications.Contracts.Services;

public interface IUserActivityService
{
    Task<UserActivityResult> CreateAsync(CreateUserActivityParameters parameters);
    Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(GetMyUserActivityParameters parameters);
}
