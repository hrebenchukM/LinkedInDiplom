using Content.Client.Contracts;
using Content.Contracts.Parameters.Comment;
using Content.Contracts.Parameters.Media;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Parameters.PostMedia;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Results;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Requests.Reaction;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using ContentCommentDto = Content.Contracts.DTOs.CommentDto;
using ContentMediaDto = Content.Contracts.DTOs.MediaDto;
using ContentPostDto = Content.Contracts.DTOs.PostDto;
using ContentPostMediaDto = Content.Contracts.DTOs.PostMediaDto;
using ContentReactionDto = Content.Contracts.DTOs.ReactionDto;

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
}
