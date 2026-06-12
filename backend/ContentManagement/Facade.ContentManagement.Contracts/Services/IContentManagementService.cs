using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Feed;
using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Requests.Hashtag;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Requests.PostHashtag;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Requests.Mention;
using Facade.ContentManagement.Contracts.Requests.Reaction;
using Facade.ContentManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;

namespace Facade.ContentManagement.Contracts.Services;

// Фасадный сервис для Content-модуля
public interface IContentManagementService
{
    Task<MediaResponse> CreateMediaAsync(CreateMediaRequest request);

    Task<MediaResponse> UploadMediaAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<MediaDto?> GetMediaByIdAsync(Guid mediaId);

    Task<PostResponse> CreatePostAsync(string userId, CreatePostRequest request);

    Task<PagedResponse<PostDto>> GetMyPostsAsync(
        string userId,
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<PostDto>> GetUserPostsAsync(
        string authorUserId,
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<PostDto>> GetFeedPostsAsync(
        string? userId,
        FeedPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<PostDto?> GetPostByIdAsync(string userId, Guid postId);

    Task<PostResponse> UpdatePostAsync(string userId, Guid postId, UpdatePostRequest request);

    Task<PostResponse> DeletePostAsync(string userId, Guid postId);

    Task<PostMediaResponse> AttachPostMediaAsync(
        string userId,
        Guid postId,
        AttachPostMediaRequest request);

    Task<PostMediaResponse> DetachPostMediaAsync(string userId, Guid postId, Guid mediaId);

    Task<IReadOnlyCollection<PostMediaDto>> GetPostMediaAsync(string userId, Guid postId);

    Task<CommentResponse> CreateCommentAsync(string userId, Guid postId, CreateCommentRequest request);

    Task<PagedResponse<CommentDto>> GetCommentsByPostIdAsync(
        string userId,
        Guid postId,
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<CommentResponse> UpdateCommentAsync(string userId, Guid commentId, UpdateCommentRequest request);

    Task<CommentResponse> DeleteCommentAsync(string userId, Guid commentId);

    Task<ReactionResponse> UpsertReactionAsync(string userId, Guid postId, UpsertReactionRequest request);

    Task<ReactionResponse> DeleteReactionAsync(string userId, Guid postId);

    Task<ReactionDto?> GetMyReactionByPostIdAsync(string userId, Guid postId);

    Task<IReadOnlyCollection<ReactionDto>> GetReactionsByPostIdAsync(string userId, Guid postId);

    Task<HashtagResponse> CreateHashtagAsync(CreateHashtagRequest request);

    Task<HashtagDto?> GetHashtagByIdAsync(Guid hashtagId);

    Task<PagedResponse<HashtagDto>> GetHashtagsAsync(
        GetHashtagsQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<PostHashtagResponse> AttachPostHashtagAsync(
        string userId,
        Guid postId,
        AttachPostHashtagRequest request);

    Task<PostHashtagResponse> DetachPostHashtagAsync(string userId, Guid postId, Guid hashtagId);

    Task<IReadOnlyCollection<PostHashtagDto>> GetPostHashtagsAsync(string userId, Guid postId);

    Task<UserHashtagFollowResponse> FollowHashtagAsync(string userId, Guid hashtagId);

    Task<UserHashtagFollowResponse> UnfollowHashtagAsync(string userId, Guid hashtagId);

    Task<IReadOnlyCollection<UserHashtagFollowDto>> GetMyHashtagFollowsAsync(string userId);

    Task<SavedPostResponse> SavePostAsync(string userId, Guid postId);

    Task<SavedPostResponse> UnsavePostAsync(string userId, Guid postId);

    Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(string userId);

    Task<RepostResponse> RepostPostAsync(string userId, Guid postId);

    Task<RepostResponse> UnrepostPostAsync(string userId, Guid postId);

    Task<IReadOnlyCollection<RepostDto>> GetMyRepostsAsync(string userId);

    Task<IReadOnlyCollection<RepostDto>> GetRepostsByPostIdAsync(string userId, Guid postId);

    Task<PostViewResponse> RecordPostViewAsync(
        string userId,
        Guid postId,
        string viewerIp,
        string? viewerUserAgent,
        string? source);

    Task<IReadOnlyCollection<PostViewDto>?> GetPostViewsAsync(string userId, Guid postId);

    Task<MentionResponse> AddMentionAsync(string userId, Guid postId, AddMentionRequest request);

    Task<MentionResponse> RemoveMentionAsync(string userId, Guid postId, string mentionedUserId);

    Task<IReadOnlyCollection<MentionDto>> GetMentionsByPostIdAsync(string userId, Guid postId);
}
