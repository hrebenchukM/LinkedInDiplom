using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

/// <summary>
/// Facade-контроллер для работы с постами и media-связями поста.
/// Бизнес-правила не хранятся здесь: контроллер только валидирует вход и вызывает facade service.
/// </summary>
public class ContentPostsController : ContentManagementControllerBase
{
    public ContentPostsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/me/posts
    [Authorize]
    [HttpPost("me/posts")]
    [ProducesResponseType(typeof(PostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        // userId берём только из JWT, чтобы нельзя было подменить владельца в body.
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Facade service делает orchestration между facade request и core client.
        var response = await ContentService.CreatePostAsync(userId, request);

        if (!response.Success)
        {
            return MapPostError(response);
        }

        return Ok(response);
    }

    // GET api/content/me/posts
    [Authorize]
    [HttpGet("me/posts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyPosts()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await ContentService.GetMyPostsAsync(userId);

        return Ok(items);
    }

    // GET api/content/posts/{postId}
    [Authorize]
    [HttpGet("posts/{postId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPostById(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await ContentService.GetPostByIdAsync(userId, postId);

        if (item == null)
        {
            return NotFoundError(PostNotFoundError);
        }

        return Ok(item);
    }

    // PATCH api/content/me/posts/{postId}
    [Authorize]
    [HttpPatch("me/posts/{postId:guid}")]
    [ProducesResponseType(typeof(PostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdatePost(
        Guid postId,
        [FromBody] UpdatePostRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ContentService.UpdatePostAsync(userId, postId, request);

        if (!response.Success)
        {
            return MapPostError(response);
        }

        return Ok(response);
    }

    // DELETE api/content/me/posts/{postId}
    [Authorize]
    [HttpDelete("me/posts/{postId:guid}")]
    [ProducesResponseType(typeof(PostResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ContentService.DeletePostAsync(userId, postId);

        if (!response.Success)
        {
            return MapPostError(response);
        }

        return Ok(response);
    }

    // POST api/content/me/posts/{postId}/media
    [Authorize]
    [HttpPost("me/posts/{postId:guid}/media")]
    [ProducesResponseType(typeof(PostMediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachPostMedia(
        Guid postId,
        [FromBody] AttachPostMediaRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ContentService.AttachPostMediaAsync(userId, postId, request);

        if (!response.Success)
        {
            return MapPostMediaError(response);
        }

        return Ok(response);
    }

    // GET api/content/me/posts/{postId}/media
    [Authorize]
    [HttpGet("me/posts/{postId:guid}/media")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPostMedia(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await ContentService.GetPostMediaAsync(userId, postId);

        return Ok(items);
    }

    // DELETE api/content/me/posts/{postId}/media/{mediaId}
    [Authorize]
    [HttpDelete("me/posts/{postId:guid}/media/{mediaId:guid}")]
    [ProducesResponseType(typeof(PostMediaResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DetachPostMedia(Guid postId, Guid mediaId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ContentService.DetachPostMediaAsync(userId, postId, mediaId);

        if (!response.Success)
        {
            return MapPostMediaError(response);
        }

        return Ok(response);
    }
}
