using Facade.ContentManagement.Contracts.Requests.Hashtag;
using Facade.ContentManagement.Contracts.Requests.PostHashtag;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentHashtagsController : ContentManagementControllerBase
{
    public ContentHashtagsController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/hashtags
    [Authorize(Roles = IdentityRoleNames.Admin)]
    [HttpPost("hashtags")]
    [ProducesResponseType(typeof(HashtagResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateHashtag([FromBody] CreateHashtagRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.CreateHashtagAsync(request);

        if (!response.Success)
            return MapHashtagError(response);

        return Ok(response);
    }

    // GET api/content/hashtags/{hashtagId}
    [Authorize]
    [HttpGet("hashtags/{hashtagId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetHashtagById(Guid hashtagId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var hashtag = await ContentService.GetHashtagByIdAsync(hashtagId);

        if (hashtag == null)
            return NotFoundError(HashtagNotFoundError);

        return Ok(hashtag);
    }

    // POST api/content/me/posts/{postId}/hashtags
    [Authorize]
    [HttpPost("me/posts/{postId:guid}/hashtags")]
    [ProducesResponseType(typeof(PostHashtagResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachPostHashtag(
        Guid postId,
        [FromBody] AttachPostHashtagRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.AttachPostHashtagAsync(userId, postId, request);

        if (!response.Success)
            return MapPostHashtagError(response);

        return Ok(response);
    }

    // GET api/content/posts/{postId}/hashtags
    [Authorize]
    [HttpGet("posts/{postId:guid}/hashtags")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPostHashtags(Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var hashtags = await ContentService.GetPostHashtagsAsync(userId, postId);

        return Ok(hashtags);
    }

    // DELETE api/content/me/posts/{postId}/hashtags/{hashtagId}
    [Authorize]
    [HttpDelete("me/posts/{postId:guid}/hashtags/{hashtagId:guid}")]
    [ProducesResponseType(typeof(PostHashtagResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DetachPostHashtag(Guid postId, Guid hashtagId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.DetachPostHashtagAsync(userId, postId, hashtagId);

        if (!response.Success)
            return MapPostHashtagError(response);

        return Ok(response);
    }

    // POST api/content/me/hashtags/{hashtagId}/follow
    [Authorize]
    [HttpPost("me/hashtags/{hashtagId:guid}/follow")]
    [ProducesResponseType(typeof(UserHashtagFollowResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> FollowHashtag(Guid hashtagId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.FollowHashtagAsync(userId, hashtagId);

        if (!response.Success)
            return MapUserHashtagFollowError(response);

        return Ok(response);
    }

    // DELETE api/content/me/hashtags/{hashtagId}/follow
    [Authorize]
    [HttpDelete("me/hashtags/{hashtagId:guid}/follow")]
    [ProducesResponseType(typeof(UserHashtagFollowResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnfollowHashtag(Guid hashtagId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.UnfollowHashtagAsync(userId, hashtagId);

        if (!response.Success)
            return MapUserHashtagFollowError(response);

        return Ok(response);
    }

    // GET api/content/me/hashtags/following
    [Authorize]
    [HttpGet("me/hashtags/following")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyHashtagFollows()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var follows = await ContentService.GetMyHashtagFollowsAsync(userId);

        return Ok(follows);
    }
}
