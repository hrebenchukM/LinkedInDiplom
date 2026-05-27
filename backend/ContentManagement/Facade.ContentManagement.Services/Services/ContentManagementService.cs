using Content.Client.Contracts;
using Content.Contracts.Parameters.Comment;
using Content.Contracts.Parameters.Hashtag;
using Content.Contracts.Parameters.Media;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Parameters.Mention;
using Content.Contracts.Parameters.PostHashtag;
using Content.Contracts.Parameters.PostMedia;
using Content.Contracts.Parameters.PostView;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Parameters.Repost;
using Content.Contracts.Parameters.SavedPost;
using Content.Contracts.Parameters.UserHashtagFollow;
using Content.Contracts.Results;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Requests.Hashtag;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Requests.Mention;
using Facade.ContentManagement.Contracts.Requests.PostHashtag;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Requests.Reaction;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using ContentCommentDto = Content.Contracts.DTOs.CommentDto;
using ContentHashtagDto = Content.Contracts.DTOs.HashtagDto;
using ContentMediaDto = Content.Contracts.DTOs.MediaDto;
using ContentMentionDto = Content.Contracts.DTOs.MentionDto;
using ContentPostDto = Content.Contracts.DTOs.PostDto;
using ContentPostHashtagDto = Content.Contracts.DTOs.PostHashtagDto;
using ContentPostMediaDto = Content.Contracts.DTOs.PostMediaDto;
using ContentPostViewDto = Content.Contracts.DTOs.PostViewDto;
using ContentReactionDto = Content.Contracts.DTOs.ReactionDto;
using ContentRepostDto = Content.Contracts.DTOs.RepostDto;
using ContentSavedPostDto = Content.Contracts.DTOs.SavedPostDto;
using ContentUserHashtagFollowDto = Content.Contracts.DTOs.UserHashtagFollowDto;

namespace Facade.ContentManagement.Services.Services;

// Фасадный сервис для Content-модуля.
// Обращается к Content через IContentClient.
public class ContentManagementService : IContentManagementService
{
    private readonly IContentClient _contentClient;

    public ContentManagementService(IContentClient contentClient)
    {
        _contentClient = contentClient;
    }

    public async Task<MediaResponse> CreateMediaAsync(CreateMediaRequest request)
    {
        var result = await _contentClient.Media.CreateAsync(new CreateMediaParameters
        {
            Url = request.Url,
            Type = request.Type
        });

        return MapMediaResult(result);
    }

    public async Task<MediaDto?> GetMediaByIdAsync(Guid mediaId)
    {
        var media = await _contentClient.Media.GetByIdAsync(new GetMediaByIdParameters
        {
            MediaId = mediaId
        });

        return media == null ? null : MapMediaToFacadeDto(media);
    }

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

    public async Task<IReadOnlyCollection<PostDto>> GetMyPostsAsync(string userId)
    {
        var posts = await _contentClient.Posts.GetMyPostsAsync(new GetMyPostsParameters
        {
            AuthorId = userId
        });

        return posts.Select(MapPostToFacadeDto).ToList();
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

    public async Task<PostMediaResponse> AttachPostMediaAsync(
        string userId,
        Guid postId,
        AttachPostMediaRequest request)
    {
        var result = await _contentClient.PostMedia.AttachAsync(new AttachMediaToPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            MediaId = request.MediaId
        });

        return MapPostMediaResult(result);
    }

    public async Task<PostMediaResponse> DetachPostMediaAsync(string userId, Guid postId, Guid mediaId)
    {
        var result = await _contentClient.PostMedia.DetachAsync(new DetachMediaFromPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            MediaId = mediaId
        });

        return MapPostMediaResult(result);
    }

    public async Task<IReadOnlyCollection<PostMediaDto>> GetPostMediaAsync(string userId, Guid postId)
    {
        var links = await _contentClient.PostMedia.GetByPostIdAsync(new GetPostMediaParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return links.Select(MapPostMediaToFacadeDto).ToList();
    }

    public async Task<CommentResponse> CreateCommentAsync(string userId, Guid postId, CreateCommentRequest request)
    {
        var result = await _contentClient.Comments.CreateAsync(new CreateCommentParameters
        {
            AuthorId = userId,
            PostId = postId,
            Content = request.Content,
            ParentCommentId = request.ParentCommentId
        });

        return MapCommentResult(result);
    }

    public async Task<IReadOnlyCollection<CommentDto>> GetCommentsByPostIdAsync(string userId, Guid postId)
    {
        var comments = await _contentClient.Comments.GetByPostIdAsync(new GetCommentsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return comments.Select(MapCommentToFacadeDto).ToList();
    }

    public async Task<CommentResponse> UpdateCommentAsync(string userId, Guid commentId, UpdateCommentRequest request)
    {
        var result = await _contentClient.Comments.UpdateAsync(new UpdateCommentParameters
        {
            AuthorId = userId,
            CommentId = commentId,
            Content = request.Content
        });

        return MapCommentResult(result);
    }

    public async Task<CommentResponse> DeleteCommentAsync(string userId, Guid commentId)
    {
        var result = await _contentClient.Comments.DeleteAsync(new DeleteCommentParameters
        {
            AuthorId = userId,
            CommentId = commentId
        });

        return MapCommentResult(result);
    }

    public async Task<ReactionResponse> UpsertReactionAsync(string userId, Guid postId, UpsertReactionRequest request)
    {
        var result = await _contentClient.Reactions.UpsertAsync(new UpsertReactionParameters
        {
            UserId = userId,
            PostId = postId,
            ReactionType = request.ReactionType
        });

        return MapReactionResult(result);
    }

    public async Task<ReactionResponse> DeleteReactionAsync(string userId, Guid postId)
    {
        var result = await _contentClient.Reactions.DeleteAsync(new DeleteReactionParameters
        {
            UserId = userId,
            PostId = postId
        });

        return MapReactionResult(result);
    }

    public async Task<ReactionDto?> GetMyReactionByPostIdAsync(string userId, Guid postId)
    {
        var reaction = await _contentClient.Reactions.GetMyByPostIdAsync(new GetMyReactionParameters
        {
            UserId = userId,
            PostId = postId
        });

        return reaction == null ? null : MapReactionToFacadeDto(reaction);
    }

    public async Task<IReadOnlyCollection<ReactionDto>> GetReactionsByPostIdAsync(string userId, Guid postId)
    {
        var reactions = await _contentClient.Reactions.GetByPostIdAsync(new GetReactionsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return reactions.Select(MapReactionToFacadeDto).ToList();
    }

    public async Task<HashtagResponse> CreateHashtagAsync(CreateHashtagRequest request)
    {
        var result = await _contentClient.Hashtags.CreateAsync(new CreateHashtagParameters
        {
            Name = request.Name
        });

        return MapHashtagResult(result);
    }

    public async Task<HashtagDto?> GetHashtagByIdAsync(Guid hashtagId)
    {
        var hashtag = await _contentClient.Hashtags.GetByIdAsync(new GetHashtagByIdParameters
        {
            HashtagId = hashtagId
        });

        return hashtag == null ? null : MapHashtagToFacadeDto(hashtag);
    }

    public async Task<PostHashtagResponse> AttachPostHashtagAsync(
        string userId,
        Guid postId,
        AttachPostHashtagRequest request)
    {
        var result = await _contentClient.PostHashtags.AttachAsync(new AttachHashtagToPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            HashtagId = request.HashtagId
        });

        return MapPostHashtagResult(result);
    }

    public async Task<PostHashtagResponse> DetachPostHashtagAsync(string userId, Guid postId, Guid hashtagId)
    {
        var result = await _contentClient.PostHashtags.DetachAsync(new DetachHashtagFromPostParameters
        {
            AuthorId = userId,
            PostId = postId,
            HashtagId = hashtagId
        });

        return MapPostHashtagResult(result);
    }

    public async Task<IReadOnlyCollection<PostHashtagDto>> GetPostHashtagsAsync(string userId, Guid postId)
    {
        var links = await _contentClient.PostHashtags.GetByPostIdAsync(new GetPostHashtagsParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return links.Select(MapPostHashtagToFacadeDto).ToList();
    }

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

    public async Task<SavedPostResponse> SavePostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.SavedPosts.SaveAsync(new SavePostParameters
        {
            UserId = userId,
            PostId = postId
        });

        return MapSavedPostResult(result);
    }

    public async Task<SavedPostResponse> UnsavePostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.SavedPosts.UnsaveAsync(new UnsavePostParameters
        {
            UserId = userId,
            PostId = postId
        });

        return MapSavedPostResult(result);
    }

    public async Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(string userId)
    {
        var savedPosts = await _contentClient.SavedPosts.GetMySavedPostsAsync(new GetMySavedPostsParameters
        {
            UserId = userId
        });

        return savedPosts.Select(MapSavedPostToFacadeDto).ToList();
    }

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

    public async Task<MentionResponse> AddMentionAsync(string userId, Guid postId, AddMentionRequest request)
    {
        var result = await _contentClient.Mentions.AddAsync(new AddMentionParameters
        {
            AuthorId = userId,
            PostId = postId,
            MentionedUserId = request.MentionedUserId
        });

        return MapMentionResult(result);
    }

    public async Task<MentionResponse> RemoveMentionAsync(string userId, Guid postId, string mentionedUserId)
    {
        var result = await _contentClient.Mentions.RemoveAsync(new RemoveMentionParameters
        {
            AuthorId = userId,
            PostId = postId,
            MentionedUserId = mentionedUserId
        });

        return MapMentionResult(result);
    }

    public async Task<IReadOnlyCollection<MentionDto>> GetMentionsByPostIdAsync(string userId, Guid postId)
    {
        var mentions = await _contentClient.Mentions.GetByPostIdAsync(new GetMentionsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return mentions.Select(MapMentionToFacadeDto).ToList();
    }

    private static PostResponse MapPostResult(PostResult result)
    {
        return new PostResponse
        {
            Success = result.Succeeded,
            Post = result.Post == null ? null : MapPostToFacadeDto(result.Post),
            Errors = result.Errors
        };
    }

    private static MediaResponse MapMediaResult(MediaResult result)
    {
        return new MediaResponse
        {
            Success = result.Succeeded,
            Media = result.Media == null ? null : MapMediaToFacadeDto(result.Media),
            Errors = result.Errors
        };
    }

    private static PostMediaResponse MapPostMediaResult(PostMediaResult result)
    {
        return new PostMediaResponse
        {
            Success = result.Succeeded,
            PostMedia = result.PostMedia == null ? null : MapPostMediaToFacadeDto(result.PostMedia),
            Errors = result.Errors
        };
    }

    private static CommentResponse MapCommentResult(CommentResult result)
    {
        return new CommentResponse
        {
            Success = result.Succeeded,
            Comment = result.Comment == null ? null : MapCommentToFacadeDto(result.Comment),
            Errors = result.Errors
        };
    }

    private static ReactionResponse MapReactionResult(ReactionResult result)
    {
        return new ReactionResponse
        {
            Success = result.Succeeded,
            Reaction = result.Reaction == null ? null : MapReactionToFacadeDto(result.Reaction),
            Errors = result.Errors
        };
    }

    private static HashtagResponse MapHashtagResult(HashtagResult result)
    {
        return new HashtagResponse
        {
            Success = result.Succeeded,
            Hashtag = result.Hashtag == null ? null : MapHashtagToFacadeDto(result.Hashtag),
            Errors = result.Errors
        };
    }

    private static PostHashtagResponse MapPostHashtagResult(PostHashtagResult result)
    {
        return new PostHashtagResponse
        {
            Success = result.Succeeded,
            PostHashtag = result.PostHashtag == null ? null : MapPostHashtagToFacadeDto(result.PostHashtag),
            Errors = result.Errors
        };
    }

    private static UserHashtagFollowResponse MapUserHashtagFollowResult(UserHashtagFollowResult result)
    {
        return new UserHashtagFollowResponse
        {
            Success = result.Succeeded,
            UserHashtagFollow = result.UserHashtagFollow == null
                ? null
                : MapUserHashtagFollowToFacadeDto(result.UserHashtagFollow),
            Errors = result.Errors
        };
    }

    private static SavedPostResponse MapSavedPostResult(SavedPostResult result)
    {
        return new SavedPostResponse
        {
            Success = result.Succeeded,
            SavedPost = result.SavedPost == null ? null : MapSavedPostToFacadeDto(result.SavedPost),
            Errors = result.Errors
        };
    }

    private static RepostResponse MapRepostResult(RepostResult result)
    {
        return new RepostResponse
        {
            Success = result.Succeeded,
            Repost = result.Repost == null ? null : MapRepostToFacadeDto(result.Repost),
            Errors = result.Errors
        };
    }

    private static PostViewResponse MapPostViewResult(PostViewResult result)
    {
        return new PostViewResponse
        {
            Success = result.Succeeded,
            PostView = result.PostView == null ? null : MapPostViewToFacadeDto(result.PostView),
            Errors = result.Errors
        };
    }

    private static MentionResponse MapMentionResult(MentionResult result)
    {
        return new MentionResponse
        {
            Success = result.Succeeded,
            Mention = result.Mention == null ? null : MapMentionToFacadeDto(result.Mention),
            Errors = result.Errors
        };
    }

    private static PostDto MapPostToFacadeDto(ContentPostDto post)
    {
        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Content = post.Content,
            Visibility = post.Visibility,
            ReactionCount = post.ReactionCount,
            CommentCount = post.CommentCount,
            RepostCount = post.RepostCount,
            CreatedAt = post.CreatedAt,
            EditedAt = post.EditedAt,
            Media = post.Media?.Select(MapMediaToFacadeDto).ToList()
        };
    }

    private static MediaDto MapMediaToFacadeDto(ContentMediaDto media)
    {
        return new MediaDto
        {
            Id = media.Id,
            Url = media.Url,
            Type = media.Type,
            CreatedAt = media.CreatedAt
        };
    }

    private static PostMediaDto MapPostMediaToFacadeDto(ContentPostMediaDto postMedia)
    {
        return new PostMediaDto
        {
            Id = postMedia.Id,
            PostId = postMedia.PostId,
            MediaId = postMedia.MediaId,
            CreatedAt = postMedia.CreatedAt,
            Media = postMedia.Media == null ? null : MapMediaToFacadeDto(postMedia.Media)
        };
    }

    private static CommentDto MapCommentToFacadeDto(ContentCommentDto comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            PostId = comment.PostId,
            UserId = comment.UserId,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }

    private static ReactionDto MapReactionToFacadeDto(ContentReactionDto reaction)
    {
        return new ReactionDto
        {
            Id = reaction.Id,
            PostId = reaction.PostId,
            UserId = reaction.UserId,
            ReactionType = reaction.ReactionType,
            CreatedAt = reaction.CreatedAt
        };
    }

    private static HashtagDto MapHashtagToFacadeDto(ContentHashtagDto hashtag)
    {
        return new HashtagDto
        {
            Id = hashtag.Id,
            Name = hashtag.Name,
            CreatedAt = hashtag.CreatedAt,
            UpdatedAt = hashtag.UpdatedAt
        };
    }

    private static PostHashtagDto MapPostHashtagToFacadeDto(ContentPostHashtagDto postHashtag)
    {
        return new PostHashtagDto
        {
            Id = postHashtag.Id,
            PostId = postHashtag.PostId,
            HashtagId = postHashtag.HashtagId,
            CreatedAt = postHashtag.CreatedAt,
            Hashtag = postHashtag.Hashtag == null ? null : MapHashtagToFacadeDto(postHashtag.Hashtag)
        };
    }

    private static UserHashtagFollowDto MapUserHashtagFollowToFacadeDto(ContentUserHashtagFollowDto follow)
    {
        return new UserHashtagFollowDto
        {
            Id = follow.Id,
            UserId = follow.UserId,
            HashtagId = follow.HashtagId,
            FollowedAt = follow.FollowedAt,
            UnfollowedAt = follow.UnfollowedAt,
            Hashtag = follow.Hashtag == null ? null : MapHashtagToFacadeDto(follow.Hashtag)
        };
    }

    private static SavedPostDto MapSavedPostToFacadeDto(ContentSavedPostDto savedPost)
    {
        return new SavedPostDto
        {
            Id = savedPost.Id,
            UserId = savedPost.UserId,
            PostId = savedPost.PostId,
            SavedAt = savedPost.SavedAt,
            UnsavedAt = savedPost.UnsavedAt,
            Post = savedPost.Post == null ? null : MapPostToFacadeDto(savedPost.Post)
        };
    }

    private static RepostDto MapRepostToFacadeDto(ContentRepostDto repost)
    {
        return new RepostDto
        {
            Id = repost.Id,
            UserId = repost.UserId,
            OriginalPostId = repost.OriginalPostId,
            RepostedAt = repost.RepostedAt,
            RemovedAt = repost.RemovedAt,
            OriginalPost = repost.OriginalPost == null ? null : MapPostToFacadeDto(repost.OriginalPost)
        };
    }

    private static PostViewDto MapPostViewToFacadeDto(ContentPostViewDto postView)
    {
        return new PostViewDto
        {
            Id = postView.Id,
            PostId = postView.PostId,
            ViewerUserId = postView.ViewerUserId,
            ViewerIp = postView.ViewerIp,
            ViewerUserAgent = postView.ViewerUserAgent,
            Source = postView.Source,
            ViewedAt = postView.ViewedAt
        };
    }

    private static MentionDto MapMentionToFacadeDto(ContentMentionDto mention)
    {
        return new MentionDto
        {
            Id = mention.Id,
            PostId = mention.PostId,
            MentionedUserId = mention.MentionedUserId,
            CreatedAt = mention.CreatedAt
        };
    }
}
