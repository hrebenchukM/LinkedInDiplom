using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с подписками Network-модуля.
// Внутренняя точка доступа фасада к подпискам.
public interface IFollowResource
{
    Task<FollowResult> FollowAsync(FollowUserParameters parameters);

    Task<FollowResult> UnfollowAsync(UnfollowUserParameters parameters);

    Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(GetMyFollowingParameters parameters);

    Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(GetMyFollowersParameters parameters);
}
