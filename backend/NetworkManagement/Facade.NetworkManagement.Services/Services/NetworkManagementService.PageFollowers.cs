using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.PageFollower;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<PageFollowerResponse> FollowPageAsync(string userId, Guid pageId)
    {
        var result = await _networkClient.PageFollowers.FollowPageAsync(new FollowPageParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return MapPageFollowerResult(result);
    }

    public async Task<PageFollowerResponse> UnfollowPageAsync(string userId, Guid pageId)
    {
        var result = await _networkClient.PageFollowers.UnfollowPageAsync(new UnfollowPageParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return MapPageFollowerResult(result);
    }

    public async Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(string userId)
    {
        var pages = await _networkClient.PageFollowers.GetMyFollowedPagesAsync(
            new GetMyFollowedPagesParameters
            {
                UserId = userId
            });

        return pages.Select(MapPageToFacadeDto).ToList();
    }

    public async Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(string userId, Guid pageId)
    {
        var followers = await _networkClient.PageFollowers.GetPageFollowersAsync(new GetPageFollowersParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return followers.Select(MapPageFollowerToFacadeDto).ToList();
    }
}
