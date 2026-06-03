using System.Security.Claims;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

[ApiController]
[Route("api/content")]
/// <summary>
/// Базовый controller facade-слоя Content.
/// Хранит общий route, чтение current user из JWT и единый map ошибок в HTTP-коды.
/// </summary>
public abstract class ContentManagementControllerBase : ControllerBase
{
    //Это список стандартных ошибок.
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

    // Это список ошибок, которые считаются 404 Not Found.
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

    private static readonly HashSet<string> HashtagNotFoundErrors = new(StringComparer.Ordinal)
    {
        HashtagNotFoundError
    };

    //Это готовый метод для ошибок поста.Он говорит:
    //Проверь ошибки в PostResponse.Если там ошибка “post not found” или “media not found” — верни 404. Иначе 400.
    //Чтобы в каждом контроллере не писать одно и то же вручную.
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
        MapErrors(response, response.Errors, HashtagNotFoundErrors);

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

    //Это достаёт id текущего пользователя из JWT-токена.
    //Он проверяет два варианта:

    //ClaimTypes.NameIdentifier
    //sub
    protected string? GetCurrentUserId() =>
        // Поддерживаем оба варианта claim: NameIdentifier и sub.
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult NotFoundError(string message) =>
        NotFound(new { success = false, errors = new[] { message } });

    //Если среди ошибок есть ошибка “не найдено” — верни 404.
    //Если ошибка другая — верни 400.
    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        // Если ошибка соответствует not found — возвращаем 404, иначе 400.
        // Это даёт единообразный error handling во всех feature-контроллерах модуля.
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
//общая база для всех Content-контроллеров.
//не дублировать код
//единым способом получать userId из токена
//единым способом обрабатывать ошибки
//возвращать правильные HTTP-коды
//держать общий ContentService