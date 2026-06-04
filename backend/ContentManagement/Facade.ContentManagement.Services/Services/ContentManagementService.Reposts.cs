using Content.Contracts.Parameters.Repost;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<RepostResponse> RepostPostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.Reposts.RepostAsync(new RepostPostParameters
        {
            UserId = userId,
            OriginalPostId = postId
        });

        return MapRepostResult(result);
    }

    public async Task<RepostResponse> UnrepostPostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.Reposts.UnrepostAsync(new UnrepostPostParameters
        {
            UserId = userId,
            OriginalPostId = postId
        });

        return MapRepostResult(result);
    }

    public async Task<IReadOnlyCollection<RepostDto>> GetMyRepostsAsync(string userId)
    {
        var reposts = await _contentClient.Reposts.GetMyRepostsAsync(new GetMyRepostsParameters
        {
            UserId = userId
        });

        return reposts.Select(MapRepostToFacadeDto).ToList();
    }

    public async Task<IReadOnlyCollection<RepostDto>> GetRepostsByPostIdAsync(string userId, Guid postId)
    {
        var reposts = await _contentClient.Reposts.GetByPostIdAsync(new GetRepostsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return reposts.Select(MapRepostToFacadeDto).ToList();
    }
}
