using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
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
}
