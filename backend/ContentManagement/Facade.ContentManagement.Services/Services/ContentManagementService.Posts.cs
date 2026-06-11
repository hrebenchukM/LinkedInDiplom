using Content.Contracts.Parameters.Post;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Feed;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
using Network.Contracts.Parameters.Network;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<PostResponse> CreatePostAsync(string userId, CreatePostRequest request)
    {
        var result = await _contentClient.Posts.CreateAsync(new CreatePostParameters
        {
            AuthorId = userId,
            Content = request.Content,
            Visibility = request.Visibility ?? string.Empty,
            MediaIds = request.MediaIds
        });

        return MapPostResult(result);
    }

    public async Task<PagedResponse<PostDto>> GetMyPostsAsync(
        string userId,
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _contentClient.Posts.GetMyPostsAsync(new GetMyPostsParameters
        {
            AuthorId = userId,
            Skip = skip,
            Take = pageSize
        });

        var items = result.Items.Select(MapPostToFacadeDto).ToList();
        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    public async Task<PagedResponse<PostDto>> GetUserPostsAsync(
        string authorUserId,
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _contentClient.Posts.GetUserPublicPostsAsync(new GetUserPublicPostsParameters
        {
            AuthorUserId = authorUserId,
            Skip = skip,
            Take = pageSize
        });

        var items = result.Items.Select(MapPostToFacadeDto).ToList();
        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    public async Task<PagedResponse<PostDto>> GetFeedPostsAsync(
        string? userId,
        FeedPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = request.ResolvePaging();

        IReadOnlyCollection<string>? authorUserIds = null;
        string? viewerUserId = null;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            viewerUserId = userId;
            authorUserIds = await ResolveFeedAuthorUserIdsAsync(userId, cancellationToken);
        }

        var result = await _contentClient.Posts.GetFeedPostsAsync(new GetFeedPostsParameters
        {
            Skip = skip,
            Take = pageSize,
            ViewerUserId = viewerUserId,
            AuthorUserIds = authorUserIds
        });

        var items = result.Items.Select(MapPostToFacadeDto).ToList();
        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    private async Task<IReadOnlyCollection<string>?> ResolveFeedAuthorUserIdsAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var networkResult = await _networkClient.UserGraph.GetUserNetworkUserIdsAsync(
            new GetUserNetworkUserIdsParameters
            {
                UserId = userId
            },
            cancellationToken);

        if (networkResult.UserIds.Count == 0)
        {
            return null;
        }

        var authorIds = new HashSet<string>(networkResult.UserIds, StringComparer.Ordinal)
        {
            userId
        };

        return authorIds.ToList();
    }

    public async Task<PostDto?> GetPostByIdAsync(string userId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return post == null ? null : MapPostToFacadeDto(post);
    }

    public async Task<PostResponse> UpdatePostAsync(string userId, Guid postId, UpdatePostRequest request)
    {
        var result = await _contentClient.Posts.UpdateAsync(new UpdatePostParameters
        {
            AuthorId = userId,
            PostId = postId,
            Content = request.Content,
            Visibility = request.Visibility
        });

        return MapPostResult(result);
    }

    public async Task<PostResponse> DeletePostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.Posts.DeleteAsync(new DeletePostParameters
        {
            AuthorId = userId,
            PostId = postId
        });

        return MapPostResult(result);
    }
}
