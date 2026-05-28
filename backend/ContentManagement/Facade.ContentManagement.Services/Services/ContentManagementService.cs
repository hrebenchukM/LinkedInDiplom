using Content.Client.Contracts;
using Content.Contracts.Results;
using Facade.ContentManagement.Contracts.DTOs;
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
public partial class ContentManagementService : IContentManagementService
{
    private readonly IContentClient _contentClient;

    public ContentManagementService(IContentClient contentClient)
    {
        _contentClient = contentClient;
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
