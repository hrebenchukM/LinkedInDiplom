using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса постов
public interface IPostService
{
    Task<PostResult> CreateAsync(CreatePostParameters parameters);

    Task<MyPostsResult> GetMyPostsAsync(GetMyPostsParameters parameters);

    Task<MyPostsResult> GetUserPublicPostsAsync(GetUserPublicPostsParameters parameters);

    Task<FeedPostsResult> GetFeedPostsAsync(GetFeedPostsParameters parameters);

    Task<PostDto?> GetByIdAsync(GetPostByIdParameters parameters);

    Task<PostResult> UpdateAsync(UpdatePostParameters parameters);

    Task<PostResult> DeleteAsync(DeletePostParameters parameters);

    Task AdminSoftDeletePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default);

    Task AdminRestorePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default);

    Task<AdminPostsResult> GetAdminPostsAsync(
        GetAdminPostsParameters parameters,
        CancellationToken cancellationToken = default);

    Task<ContentStatsDto> GetContentStatsAsync(
        CancellationToken cancellationToken = default);
}
