using Content.Contracts.Parameters.UserHashtagFollow;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<UserHashtagFollowResponse> FollowHashtagAsync(string userId, Guid hashtagId)
    {
        var result = await _contentClient.UserHashtagFollows.FollowAsync(new FollowHashtagParameters
        {
            UserId = userId,
            HashtagId = hashtagId
        });

        return MapUserHashtagFollowResult(result);
    }

    public async Task<UserHashtagFollowResponse> UnfollowHashtagAsync(string userId, Guid hashtagId)
    {
        var result = await _contentClient.UserHashtagFollows.UnfollowAsync(new UnfollowHashtagParameters
        {
            UserId = userId,
            HashtagId = hashtagId
        });

        return MapUserHashtagFollowResult(result);
    }

    public async Task<IReadOnlyCollection<UserHashtagFollowDto>> GetMyHashtagFollowsAsync(string userId)
    {
        var follows = await _contentClient.UserHashtagFollows.GetMyFollowsAsync(new GetMyHashtagFollowsParameters
        {
            UserId = userId
        });

        return follows.Select(MapUserHashtagFollowToFacadeDto).ToList();
    }
}
