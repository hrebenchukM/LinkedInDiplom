using Facade.EventsManagement.Contracts.DTOs;
using Facade.FileStorage.Contracts.Upload;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.Constants;
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

    [HttpGet("speakers")]
    [ProducesResponseType(typeof(PagedResponse<EventSpeakerDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetSpeakers(
        [FromQuery] GetEventSpeakersQueryRequest request,
        CancellationToken cancellationToken)
    {
        var speakers = await EventsService.GetSpeakersAsync(request, cancellationToken);
        return Ok(speakers);
    }

    [Authorize(Roles = IdentityRoleNames.Admin)]
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

    [Authorize(Roles = IdentityRoleNames.Admin)]
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
    [Authorize(Roles = IdentityRoleNames.Admin)]
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

        var validationError = FileUploadValidation.Validate(
            file?.Length,
            FileUploadConstants.ImageMaxSizeBytes,
            FileUploadValidation.ImageTooLargeMessage);
        if (validationError != null)
            return MediaBadRequest(validationError);

        await using var stream = file!.OpenReadStream();

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

    [Authorize(Roles = IdentityRoleNames.Admin)]
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
