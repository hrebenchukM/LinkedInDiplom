using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageFollower;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для подписчиков страниц.
// Делегирует вызовы в IPageFollowerService.
public class PageFollowerResource : IPageFollowerResource
{
    private readonly IPageFollowerService _pageFollowerService;

    public PageFollowerResource(IPageFollowerService pageFollowerService)
    {
        _pageFollowerService = pageFollowerService;
    }

    public Task<PageFollowerResult> FollowPageAsync(FollowPageParameters parameters)
    {
        return _pageFollowerService.FollowPageAsync(parameters);
    }

    public Task<PageFollowerResult> UnfollowPageAsync(UnfollowPageParameters parameters)
    {
        return _pageFollowerService.UnfollowPageAsync(parameters);
    }

    public Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(GetMyFollowedPagesParameters parameters)
    {
        return _pageFollowerService.GetMyFollowedPagesAsync(parameters);
    }

    public Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(GetPageFollowersParameters parameters)
    {
        return _pageFollowerService.GetPageFollowersAsync(parameters);
    }
}
