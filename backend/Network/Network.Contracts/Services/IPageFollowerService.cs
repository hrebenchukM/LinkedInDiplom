using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageFollower;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса подписчиков страниц
public interface IPageFollowerService
{
    Task<PageFollowerResult> FollowPageAsync(FollowPageParameters parameters);

    Task<PageFollowerResult> UnfollowPageAsync(UnfollowPageParameters parameters);

    Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(GetMyFollowedPagesParameters parameters);

    Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(GetPageFollowersParameters parameters);
}
