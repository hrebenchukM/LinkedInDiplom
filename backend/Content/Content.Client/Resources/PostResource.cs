using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

/// <summary>
/// Resource-адаптер для постов ContentClient.
/// Выступает промежуточным слоем между facade orchestration и core business-логикой.
/// </summary>
public class PostResource : IPostResource
{
    private readonly IPostService _postService;

    public PostResource(IPostService postService)
    {
        _postService = postService;
    }

    public Task<PostResult> CreateAsync(CreatePostParameters parameters)
    {
        return _postService.CreateAsync(parameters);
    }

    public Task<MyPostsResult> GetMyPostsAsync(GetMyPostsParameters parameters)
    {
        return _postService.GetMyPostsAsync(parameters);
    }

    public Task<MyPostsResult> GetUserPublicPostsAsync(GetUserPublicPostsParameters parameters)
    {
        return _postService.GetUserPublicPostsAsync(parameters);
    }

    public Task<FeedPostsResult> GetFeedPostsAsync(GetFeedPostsParameters parameters)
    {
        return _postService.GetFeedPostsAsync(parameters);
    }

    public Task<PostDto?> GetByIdAsync(GetPostByIdParameters parameters)
    {
        return _postService.GetByIdAsync(parameters);
    }

    public Task<PostResult> UpdateAsync(UpdatePostParameters parameters)
    {
        return _postService.UpdateAsync(parameters);
    }

    public Task<PostResult> DeleteAsync(DeletePostParameters parameters)
    {
        return _postService.DeleteAsync(parameters);
    }

    public Task AdminSoftDeletePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
        => _postService.AdminSoftDeletePostAsync(postId, cancellationToken);

    public Task AdminRestorePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
        => _postService.AdminRestorePostAsync(postId, cancellationToken);

    public Task<AdminPostsResult> GetAdminPostsAsync(
        GetAdminPostsParameters parameters,
        CancellationToken cancellationToken = default)
        => _postService.GetAdminPostsAsync(parameters, cancellationToken);

    public Task<ContentStatsDto> GetContentStatsAsync(
        CancellationToken cancellationToken = default)
        => _postService.GetContentStatsAsync(cancellationToken);
}
