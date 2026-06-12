using Notifications.Contracts.DTOs;
using Notifications.Contracts.Parameters.UserActivity;
using Notifications.Contracts.Results;

namespace Notifications.Client.Contracts.Resources;

public interface IUserActivityResource
{
    Task<UserActivityResult> CreateAsync(CreateUserActivityParameters parameters);
    Task<IReadOnlyCollection<UserActivityDto>> GetMyActivityAsync(GetMyUserActivityParameters parameters);
}
