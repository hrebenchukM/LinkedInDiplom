using Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.EventsManagement.Controllers.Controllers;

public class EventsEventSpeakersController : EventsManagementControllerBase
{
    public EventsEventSpeakersController(IEventsManagementService eventsManagementService)
        : base(eventsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/{eventId:guid}/speakers")]
    [ProducesResponseType(typeof(EventSpeakerMapResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachSpeakerToEvent(Guid eventId, [FromBody] AttachSpeakerToEventRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await EventsService.AttachSpeakerToEventAsync(userId, eventId, request);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/{eventId:guid}/speakers/{speakerId:guid}")]
    [ProducesResponseType(typeof(EventSpeakerMapResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DetachSpeakerFromEvent(Guid eventId, Guid speakerId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await EventsService.DetachSpeakerFromEventAsync(userId, eventId, speakerId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("{eventId:guid}/speakers")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetEventSpeakers(Guid eventId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var speakers = await EventsService.GetEventSpeakersAsync(eventId);
        return Ok(speakers);
    }
}
