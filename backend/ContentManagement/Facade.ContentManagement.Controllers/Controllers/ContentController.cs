using System.Security.Claims;
using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Requests.PostMedia;
using Facade.ContentManagement.Contracts.Requests.Reaction;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private const string PostNotFoundError = "Post not found.";
    private const string CommentNotFoundError = "Comment not found.";
    private const string MediaNotFoundError = "Media not found.";
    private const string PostMediaNotFoundError = "Post media not found.";
    private const string ReactionNotFoundError = "Reaction not found.";
    private const string ParentCommentNotFoundError = "Parent comment not found.";

    private readonly IContentManagementService _contentManagementService;

    public ContentController(IContentManagementService contentManagementService)
    {
        _contentManagementService = contentManagementService;
    }

    // POST api/content/me/media
    [Authorize]
    [HttpPost("me/media")]
    [ProducesResponseType(typeof(MediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMedia([FromBody] CreateMediaRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _contentManagementService.CreateMediaAsync(request);

        if (!response.Success)
            return MapMediaError(response);

        return Ok(response);
    }

    // GET api/content/media/{mediaId}
    [Authorize]
    [HttpGet("media/{mediaId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMediaById(Guid mediaId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var media = await _contentManagementService.GetMediaByIdAsync(mediaId);

        if (media == null)
            return NotFound();

        return Ok(media);
    }

    // POST api/content/me/posts
    [Authorize]
    [HttpPost("me/posts")]
    [ProducesResponseType(typeof(PostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _contentManagementService.CreatePostAsync(userId, request);

        if (!response.Success)
            return MapPostError(response);

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
            return Unauthorized();

        var posts = await _contentManagementService.GetMyPostsAsync(userId);

        return Ok(posts);
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
            return Unauthorized();

        var post = await _contentManagementService.GetPostByIdAsync(userId, postId);

        if (post == null)
            return NotFound();

        return Ok(post);
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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _contentManagementService.UpdatePostAsync(userId, postId, request);

        if (!response.Success)
            return MapPostError(response);

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
            return Unauthorized();

        var response = await _contentManagementService.DeletePostAsync(userId, postId);

        if (!response.Success)
            return MapPostError(response);

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _contentManagementService.AttachPostMediaAsync(userId, postId, request);

        if (!response.Success)
            return MapPostMediaError(response);

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
            return Unauthorized();

        var media = await _contentManagementService.GetPostMediaAsync(userId, postId);

        return Ok(media);
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
            return Unauthorized();

        var response = await _contentManagementService.DetachPostMediaAsync(userId, postId, mediaId);

        if (!response.Success)
            return MapPostMediaError(response);

        return Ok(response);
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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _contentManagementService.CreateCommentAsync(userId, postId, request);

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

        var comments = await _contentManagementService.GetCommentsByPostIdAsync(userId, postId);

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _contentManagementService.UpdateCommentAsync(userId, commentId, request);

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

        var response = await _contentManagementService.DeleteCommentAsync(userId, commentId);

        if (!response.Success)
            return MapCommentError(response);

        return Ok(response);
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

        var response = await _contentManagementService.UpsertReactionAsync(userId, postId, request);

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

        var response = await _contentManagementService.DeleteReactionAsync(userId, postId);

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

        var reaction = await _contentManagementService.GetMyReactionByPostIdAsync(userId, postId);

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

        var reactions = await _contentManagementService.GetReactionsByPostIdAsync(userId, postId);

        return Ok(reactions);
    }

    private IActionResult MapPostError(PostResponse response)
    {
        if (response.Errors.Contains(PostNotFoundError) ||
            response.Errors.Contains(MediaNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapMediaError(MediaResponse response)
    {
        if (response.Errors.Contains(MediaNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapPostMediaError(PostMediaResponse response)
    {
        if (response.Errors.Contains(PostNotFoundError) ||
            response.Errors.Contains(MediaNotFoundError) ||
            response.Errors.Contains(PostMediaNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapCommentError(CommentResponse response)
    {
        if (response.Errors.Contains(PostNotFoundError) ||
            response.Errors.Contains(CommentNotFoundError) ||
            response.Errors.Contains(ParentCommentNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapReactionError(ReactionResponse response)
    {
        if (response.Errors.Contains(PostNotFoundError) ||
            response.Errors.Contains(ReactionNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }
}
