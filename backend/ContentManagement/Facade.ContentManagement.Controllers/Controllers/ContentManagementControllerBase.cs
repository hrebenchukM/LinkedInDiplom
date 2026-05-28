using System.Security.Claims;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

[ApiController]
[Route("api/content")]
public abstract class ContentManagementControllerBase : ControllerBase
{
    protected const string PostNotFoundError = "Post not found.";
    protected const string CommentNotFoundError = "Comment not found.";
    protected const string MediaNotFoundError = "Media not found.";
    protected const string PostMediaNotFoundError = "Post media not found.";
    protected const string ReactionNotFoundError = "Reaction not found.";
    protected const string ParentCommentNotFoundError = "Parent comment not found.";
    protected const string HashtagNotFoundError = "Hashtag not found.";
    protected const string PostHashtagNotFoundError = "Post hashtag not found.";
    protected const string HashtagFollowNotFoundError = "Hashtag follow not found.";
    protected const string SavedPostNotFoundError = "Saved post not found.";
    protected const string RepostNotFoundError = "Repost not found.";
    protected const string MentionNotFoundError = "Mention not found.";

    protected IContentManagementService ContentService { get; }

    protected ContentManagementControllerBase(IContentManagementService contentManagementService)
    {
        ContentService = contentManagementService;
    }

    private static readonly HashSet<string> PostAndMediaNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        MediaNotFoundError
    };

    private static readonly HashSet<string> MediaNotFoundErrors = new(StringComparer.Ordinal)
    {
        MediaNotFoundError
    };

    private static readonly HashSet<string> PostMediaNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        MediaNotFoundError,
        PostMediaNotFoundError
    };

    private static readonly HashSet<string> CommentNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        CommentNotFoundError,
        ParentCommentNotFoundError
    };

    private static readonly HashSet<string> ReactionNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        ReactionNotFoundError
    };

    private static readonly HashSet<string> PostHashtagNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        HashtagNotFoundError,
        PostHashtagNotFoundError
    };

    private static readonly HashSet<string> UserHashtagFollowNotFoundErrors = new(StringComparer.Ordinal)
    {
        HashtagNotFoundError,
        HashtagFollowNotFoundError
    };

    private static readonly HashSet<string> SavedPostNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        SavedPostNotFoundError
    };

    private static readonly HashSet<string> RepostNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        RepostNotFoundError
    };

    private static readonly HashSet<string> PostViewNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError
    };

    private static readonly HashSet<string> MentionNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        MentionNotFoundError
    };

    private static readonly HashSet<string> NoNotFoundErrors = new(StringComparer.Ordinal);

    protected IActionResult MapPostError(PostResponse response) =>
        MapErrors(response, response.Errors, PostAndMediaNotFoundErrors);

    protected IActionResult MapMediaError(MediaResponse response) =>
        MapErrors(response, response.Errors, MediaNotFoundErrors);

    protected IActionResult MapPostMediaError(PostMediaResponse response) =>
        MapErrors(response, response.Errors, PostMediaNotFoundErrors);

    protected IActionResult MapCommentError(CommentResponse response) =>
        MapErrors(response, response.Errors, CommentNotFoundErrors);

    protected IActionResult MapReactionError(ReactionResponse response) =>
        MapErrors(response, response.Errors, ReactionNotFoundErrors);

    protected IActionResult MapHashtagError(HashtagResponse response) =>
        MapErrors(response, response.Errors, NoNotFoundErrors);

    protected IActionResult MapPostHashtagError(PostHashtagResponse response) =>
        MapErrors(response, response.Errors, PostHashtagNotFoundErrors);

    protected IActionResult MapUserHashtagFollowError(UserHashtagFollowResponse response) =>
        MapErrors(response, response.Errors, UserHashtagFollowNotFoundErrors);

    protected IActionResult MapSavedPostError(SavedPostResponse response) =>
        MapErrors(response, response.Errors, SavedPostNotFoundErrors);

    protected IActionResult MapRepostError(RepostResponse response) =>
        MapErrors(response, response.Errors, RepostNotFoundErrors);

    protected IActionResult MapPostViewError(PostViewResponse response) =>
        MapErrors(response, response.Errors, PostViewNotFoundErrors);

    protected IActionResult MapMentionError(MentionResponse response) =>
        MapErrors(response, response.Errors, MentionNotFoundErrors);

    protected string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
