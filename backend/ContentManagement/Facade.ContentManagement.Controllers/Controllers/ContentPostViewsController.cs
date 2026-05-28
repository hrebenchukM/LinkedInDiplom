using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentPostViewsController : ContentManagementControllerBase
{
    public ContentPostViewsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/posts/{postId}/views
    [Authorize]
    [HttpPost("posts/{postId:guid}/views")]
    [ProducesResponseType(typeof(PostViewResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RecordPostView(Guid postId, [FromQuery] string? source)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var viewerIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (string.IsNullOrWhiteSpace(viewerIp))
            viewerIp = "unknown";

        var viewerUserAgent = Request.Headers.UserAgent.ToString();

        if (string.IsNullOrWhiteSpace(viewerUserAgent))
            viewerUserAgent = null;

        var response = await ContentService.RecordPostViewAsync(
            userId,
            postId,
            viewerIp,
            viewerUserAgent,
            source);

        if (!response.Success)
            return MapPostViewError(response);

        return Ok(response);
    }

    // GET api/content/me/posts/{postId}/views
    [Authorize]
    [HttpGet("me/posts/{postId:guid}/views")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetPostViews(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var views = await ContentService.GetPostViewsAsync(userId, postId);

        if (views == null)
        {
            return NotFound(new PostViewResponse
            {
                Success = false,
                Errors = new[] { PostNotFoundError }
            });
        }

        return Ok(views);
    }
}
