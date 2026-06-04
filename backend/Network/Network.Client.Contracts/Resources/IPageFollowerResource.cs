using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageFollower;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с подписчиками страниц Network-модуля.
// Внутренняя точка доступа фасада к подписчикам страниц.
public interface IPageFollowerResource
{
    Task<PageFollowerResult> FollowPageAsync(FollowPageParameters parameters);

    Task<PageFollowerResult> UnfollowPageAsync(UnfollowPageParameters parameters);

    Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(GetMyFollowedPagesParameters parameters);

    Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(GetPageFollowersParameters parameters);
}
