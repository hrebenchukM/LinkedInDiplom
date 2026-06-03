using Facade.ContentManagement.Contracts.Requests.Mention;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentMentionsController : ContentManagementControllerBase
{
    public ContentMentionsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/me/posts/{postId}/mentions
    [Authorize]
    [HttpPost("me/posts/{postId:guid}/mentions")]
    [ProducesResponseType(typeof(MentionResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AddMention(Guid postId, [FromBody] AddMentionRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.AddMentionAsync(userId, postId, request);

        if (!response.Success)
            return MapMentionError(response);

        return Ok(response);
    }

    // DELETE api/content/me/posts/{postId}/mentions/{mentionedUserId}
    [Authorize]
    [HttpDelete("me/posts/{postId:guid}/mentions/{mentionedUserId}")]
    [ProducesResponseType(typeof(MentionResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveMention(Guid postId, string mentionedUserId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.RemoveMentionAsync(userId, postId, mentionedUserId);

        if (!response.Success)
            return MapMentionError(response);

        return Ok(response);
    }

    // GET api/content/posts/{postId}/mentions
    [Authorize]
    [HttpGet("posts/{postId:guid}/mentions")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMentionsByPostId(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var mentions = await ContentService.GetMentionsByPostIdAsync(userId, postId);

        return Ok(mentions);
    }
}
