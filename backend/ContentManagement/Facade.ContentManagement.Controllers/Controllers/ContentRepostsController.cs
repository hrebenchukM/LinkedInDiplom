using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentRepostsController : ContentManagementControllerBase
{
    public ContentRepostsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/me/posts/{postId}/repost
    [Authorize]
    [HttpPost("me/posts/{postId:guid}/repost")]
    [ProducesResponseType(typeof(RepostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RepostPost(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.RepostPostAsync(userId, postId);

        if (!response.Success)
            return MapRepostError(response);

        return Ok(response);
    }

    // DELETE api/content/me/posts/{postId}/repost
    [Authorize]
    [HttpDelete("me/posts/{postId:guid}/repost")]
    [ProducesResponseType(typeof(RepostResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnrepostPost(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.UnrepostPostAsync(userId, postId);

        if (!response.Success)
            return MapRepostError(response);

        return Ok(response);
    }

    // GET api/content/me/reposts
    [Authorize]
    [HttpGet("me/reposts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyReposts()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var reposts = await ContentService.GetMyRepostsAsync(userId);

        return Ok(reposts);
    }

    // GET api/content/posts/{postId}/reposts
    [Authorize]
    [HttpGet("posts/{postId:guid}/reposts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetRepostsByPostId(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var reposts = await ContentService.GetRepostsByPostIdAsync(userId, postId);

        return Ok(reposts);
    }
}
