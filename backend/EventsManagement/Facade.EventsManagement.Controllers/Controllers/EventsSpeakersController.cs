using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.EventsManagement.Controllers.Controllers;

public class EventsSpeakersController : EventsManagementControllerBase
{
    public EventsSpeakersController(IEventsManagementService eventsManagementService)
        : base(eventsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/speakers")]
    [ProducesResponseType(typeof(EventSpeakerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateSpeaker([FromBody] CreateEventSpeakerRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await EventsService.CreateSpeakerAsync(userId, request);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/speakers/{speakerId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSpeakerById(Guid speakerId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var speaker = await EventsService.GetSpeakerByIdAsync(userId, speakerId);
        if (speaker is null)
            return NotFoundError(SpeakerNotFoundError);

        return Ok(speaker);
    }

    [Authorize]
    [HttpPatch("me/speakers/{speakerId:guid}")]
    [ProducesResponseType(typeof(EventSpeakerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateSpeaker(Guid speakerId, [FromBody] UpdateEventSpeakerRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await EventsService.UpdateSpeakerAsync(userId, speakerId, request);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    // POST api/events/me/speakers/{speakerId}/avatar
    [Authorize]
    [HttpPost("me/speakers/{speakerId:guid}/avatar")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(EventSpeakerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UploadSpeakerAvatar(
        Guid speakerId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return MediaBadRequest("File is empty.");
        if (file.Length > 5 * 1024 * 1024)
            return MediaBadRequest("File is too large. Maximum size is 5 MB.");

        await using var stream = file.OpenReadStream();

        var response = await EventsService.UploadSpeakerAvatarAsync(
            userId,
            speakerId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/speakers/{speakerId:guid}")]
    [ProducesResponseType(typeof(EventSpeakerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteSpeaker(Guid speakerId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await EventsService.DeleteSpeakerAsync(userId, speakerId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
