using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для подписок.
// Делегирует вызовы в IFollowService.
public class FollowResource : IFollowResource
{
    private readonly IFollowService _followService;

    public FollowResource(IFollowService followService)
    {
        _followService = followService;
    }

    public Task<FollowResult> FollowAsync(FollowUserParameters parameters)
    {
        return _followService.FollowAsync(parameters);
    }

    public Task<FollowResult> UnfollowAsync(UnfollowUserParameters parameters)
    {
        return _followService.UnfollowAsync(parameters);
    }

    public Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(GetMyFollowingParameters parameters)
    {
        return _followService.GetMyFollowingAsync(parameters);
    }

    public Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(GetMyFollowersParameters parameters)
    {
        return _followService.GetMyFollowersAsync(parameters);
    }
}
