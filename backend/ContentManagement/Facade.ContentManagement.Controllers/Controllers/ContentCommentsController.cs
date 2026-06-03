using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentCommentsController : ContentManagementControllerBase
{
    public ContentCommentsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/posts/{postId}/comments
    [Authorize]
    [HttpPost("posts/{postId:guid}/comments")]
    [ProducesResponseType(typeof(CommentResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> CreateComment(Guid postId, [FromBody] CreateCommentRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.CreateCommentAsync(userId, postId, request);

        if (!response.Success)
            return MapCommentError(response);

        return Ok(response);
    }

    // GET api/content/posts/{postId}/comments
    [Authorize]
    [HttpGet("posts/{postId:guid}/comments")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetCommentsByPostId(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var comments = await ContentService.GetCommentsByPostIdAsync(userId, postId);

        return Ok(comments);
    }

    // PATCH api/content/me/comments/{commentId}
    [Authorize]
    [HttpPatch("me/comments/{commentId:guid}")]
    [ProducesResponseType(typeof(CommentResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateComment(Guid commentId, [FromBody] UpdateCommentRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.UpdateCommentAsync(userId, commentId, request);

        if (!response.Success)
            return MapCommentError(response);

        return Ok(response);
    }

    // DELETE api/content/me/comments/{commentId}
    [Authorize]
    [HttpDelete("me/comments/{commentId:guid}")]
    [ProducesResponseType(typeof(CommentResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.DeleteCommentAsync(userId, commentId);

        if (!response.Success)
            return MapCommentError(response);

        return Ok(response);
    }
}
