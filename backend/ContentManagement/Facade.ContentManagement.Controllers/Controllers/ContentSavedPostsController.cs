using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentSavedPostsController : ContentManagementControllerBase
{
    public ContentSavedPostsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/me/posts/{postId}/save
    [Authorize]
    [HttpPost("me/posts/{postId:guid}/save")]
    [ProducesResponseType(typeof(SavedPostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SavePost(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.SavePostAsync(userId, postId);

        if (!response.Success)
            return MapSavedPostError(response);

        return Ok(response);
    }

    // DELETE api/content/me/posts/{postId}/save
    [Authorize]
    [HttpDelete("me/posts/{postId:guid}/save")]
    [ProducesResponseType(typeof(SavedPostResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnsavePost(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.UnsavePostAsync(userId, postId);

        if (!response.Success)
            return MapSavedPostError(response);

        return Ok(response);
    }

    // GET api/content/me/saved-posts
    [Authorize]
    [HttpGet("me/saved-posts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMySavedPosts()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var savedPosts = await ContentService.GetMySavedPostsAsync(userId);

        return Ok(savedPosts);
    }
}
