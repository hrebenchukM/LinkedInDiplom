using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentMediaController : ContentManagementControllerBase
{
    public ContentMediaController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
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

        var response = await ContentService.CreateMediaAsync(request);

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

        var media = await ContentService.GetMediaByIdAsync(mediaId);

        if (media == null)
            return NotFound();

        return Ok(media);
    }
}
