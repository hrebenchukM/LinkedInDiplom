using Content.Contracts.Parameters.Post;
using Content.Contracts.Parameters.PostView;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<PostViewResponse> RecordPostViewAsync(
        string userId,
        Guid postId,
        string viewerIp,
        string? viewerUserAgent,
        string? source)
    {
        var result = await _contentClient.PostViews.RecordAsync(new RecordPostViewParameters
        {
            ViewerUserId = userId,
            PostId = postId,
            ViewerIp = viewerIp,
            ViewerUserAgent = viewerUserAgent,
            Source = source
        });

        return MapPostViewResult(result);
    }

    public async Task<IReadOnlyCollection<PostViewDto>?> GetPostViewsAsync(string userId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        if (post == null || post.UserId != userId)
        {
            return null;
        }

        var views = await _contentClient.PostViews.GetByPostIdAsync(new GetPostViewsParameters
        {
            AuthorId = userId,
            PostId = postId
        });

        return views.Select(MapPostViewToFacadeDto).ToList();
    }
}
