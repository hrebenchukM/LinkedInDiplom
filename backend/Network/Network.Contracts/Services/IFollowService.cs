using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса подписок между пользователями
public interface IFollowService
{
    Task<FollowResult> FollowAsync(FollowUserParameters parameters);

    Task<FollowResult> UnfollowAsync(UnfollowUserParameters parameters);

    Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(GetMyFollowingParameters parameters);

    Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(GetMyFollowersParameters parameters);
}
