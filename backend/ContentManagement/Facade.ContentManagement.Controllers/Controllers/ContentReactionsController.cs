using Facade.ContentManagement.Contracts.Requests.Reaction;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentReactionsController : ContentManagementControllerBase
{
    public ContentReactionsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // PUT api/content/posts/{postId}/reactions
    [Authorize]
    [HttpPut("posts/{postId:guid}/reactions")]
    [ProducesResponseType(typeof(ReactionResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpsertReaction(Guid postId, [FromBody] UpsertReactionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.UpsertReactionAsync(userId, postId, request);

        if (!response.Success)
            return MapReactionError(response);

        return Ok(response);
    }

    // DELETE api/content/posts/{postId}/reactions
    [Authorize]
    [HttpDelete("posts/{postId:guid}/reactions")]
    [ProducesResponseType(typeof(ReactionResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteReaction(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.DeleteReactionAsync(userId, postId);

        if (!response.Success)
            return MapReactionError(response);

        return Ok(response);
    }

    // GET api/content/posts/{postId}/reactions/me
    [Authorize]
    [HttpGet("posts/{postId:guid}/reactions/me")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyReactionByPostId(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var reaction = await ContentService.GetMyReactionByPostIdAsync(userId, postId);

        if (reaction == null)
            return NotFound(new ReactionResponse { Success = false, Errors = new[] { ReactionNotFoundError } });

        return Ok(reaction);
    }

    // GET api/content/posts/{postId}/reactions
    [Authorize]
    [HttpGet("posts/{postId:guid}/reactions")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetReactionsByPostId(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var reactions = await ContentService.GetReactionsByPostIdAsync(userId, postId);

        return Ok(reactions);
    }
}
