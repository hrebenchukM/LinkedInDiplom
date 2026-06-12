using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.UserHashtagFollow;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для подписок на хэштеги.
// Делегирует вызовы в IUserHashtagFollowService.
public class UserHashtagFollowResource : IUserHashtagFollowResource
{
    private readonly IUserHashtagFollowService _userHashtagFollowService;

    public UserHashtagFollowResource(IUserHashtagFollowService userHashtagFollowService)
    {
        _userHashtagFollowService = userHashtagFollowService;
    }

    public Task<UserHashtagFollowResult> FollowAsync(FollowHashtagParameters parameters)
    {
        return _userHashtagFollowService.FollowAsync(parameters);
    }

    public Task<UserHashtagFollowResult> UnfollowAsync(UnfollowHashtagParameters parameters)
    {
        return _userHashtagFollowService.UnfollowAsync(parameters);
    }

    public Task<IReadOnlyCollection<UserHashtagFollowDto>> GetMyFollowsAsync(GetMyHashtagFollowsParameters parameters)
    {
        return _userHashtagFollowService.GetMyFollowsAsync(parameters);
    }
}
