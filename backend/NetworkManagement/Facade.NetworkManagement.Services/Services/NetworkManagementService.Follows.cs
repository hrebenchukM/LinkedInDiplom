using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.Follow;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<FollowResponse> FollowUserAsync(string userId, FollowUserRequest request)
    {
        var result = await _networkClient.Follows.FollowAsync(new FollowUserParameters
        {
            FollowerId = userId,
            FollowingId = request.FollowingId
        });

        return MapFollowResult(result);
    }

    public async Task<FollowResponse> UnfollowUserAsync(string userId, string followingId)
    {
        var result = await _networkClient.Follows.UnfollowAsync(new UnfollowUserParameters
        {
            FollowerId = userId,
            FollowingId = followingId
        });

        return MapFollowResult(result);
    }

    public async Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(string userId)
    {
        var follows = await _networkClient.Follows.GetMyFollowingAsync(new GetMyFollowingParameters
        {
            UserId = userId
        });

        return follows.Select(MapFollowToFacadeDto).ToList();
    }

    public async Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(string userId)
    {
        var follows = await _networkClient.Follows.GetMyFollowersAsync(new GetMyFollowersParameters
        {
            UserId = userId
        });

        return follows.Select(MapFollowToFacadeDto).ToList();
    }
}
