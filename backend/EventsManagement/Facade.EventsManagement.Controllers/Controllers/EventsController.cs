using System.Security.Claims;
using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Requests.EventSchedule;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.EventsManagement.Controllers.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventsManagementService eventsManagementService) : ControllerBase
{
    private static readonly HashSet<string> NotFoundErrors =
    [
        "Event not found.",
        "Event attendee not found.",
        "Schedule item not found.",
        "Speaker not found.",
        "Event speaker not found."
    ];

    [Authorize]
    [HttpPost("me")]
    [ProducesResponseType(typeof(EventResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.CreateEventAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyEvents([FromQuery] int? limit, [FromQuery] DateTime? fromStartAt, [FromQuery] DateTime? toStartAt)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var events = await eventsManagementService.GetMyEventsAsync(userId, limit, fromStartAt, toStartAt);
        return Ok(events);
    }

    [Authorize]
    [HttpGet("{eventId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetEventById(Guid eventId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var evt = await eventsManagementService.GetEventByIdAsync(eventId);
        if (evt is null)
            return NotFound();

        return Ok(evt);
    }

    [Authorize]
    [HttpPatch("me/{eventId:guid}")]
    [ProducesResponseType(typeof(EventResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateEvent(Guid eventId, [FromBody] UpdateEventRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.UpdateEventAsync(userId, eventId, request);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/{eventId:guid}")]
    [ProducesResponseType(typeof(EventResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteEvent(Guid eventId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.DeleteEventAsync(userId, eventId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpPost("me/{eventId:guid}/join")]
    [ProducesResponseType(typeof(EventAttendeeResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> JoinEvent(Guid eventId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.JoinEventAsync(userId, eventId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/{eventId:guid}/attendance")]
    [ProducesResponseType(typeof(EventAttendeeResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LeaveEvent(Guid eventId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.LeaveEventAsync(userId, eventId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("{eventId:guid}/attendees")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetEventAttendees(Guid eventId, [FromQuery] int? limit)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var attendees = await eventsManagementService.GetEventAttendeesAsync(eventId, limit);
        return Ok(attendees);
    }

    [Authorize]
    [HttpPost("me/{eventId:guid}/schedule")]
    [ProducesResponseType(typeof(EventScheduleResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> CreateScheduleItem(Guid eventId, [FromBody] CreateEventScheduleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.CreateScheduleItemAsync(userId, eventId, request);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("{eventId:guid}/schedule")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetEventSchedule(Guid eventId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var schedule = await eventsManagementService.GetEventScheduleAsync(eventId);
        return Ok(schedule);
    }

    [Authorize]
    [HttpPatch("me/{eventId:guid}/schedule/{scheduleId:guid}")]
    [ProducesResponseType(typeof(EventScheduleResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateScheduleItem(Guid eventId, Guid scheduleId, [FromBody] UpdateEventScheduleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.UpdateScheduleItemAsync(userId, eventId, scheduleId, request);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/{eventId:guid}/schedule/{scheduleId:guid}")]
    [ProducesResponseType(typeof(EventScheduleResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteScheduleItem(Guid eventId, Guid scheduleId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.DeleteScheduleItemAsync(userId, eventId, scheduleId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpPost("me/speakers")]
    [ProducesResponseType(typeof(EventSpeakerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateSpeaker([FromBody] CreateEventSpeakerRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.CreateSpeakerAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

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

        var speaker = await eventsManagementService.GetSpeakerByIdAsync(userId, speakerId);
        if (speaker is null)
            return NotFound();

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await eventsManagementService.UpdateSpeakerAsync(userId, speakerId, request);
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

        var response = await eventsManagementService.DeleteSpeakerAsync(userId, speakerId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
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

        var response = await eventsManagementService.AttachSpeakerToEventAsync(userId, eventId, request);
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

        var response = await eventsManagementService.DetachSpeakerFromEventAsync(userId, eventId, speakerId);
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

        var speakers = await eventsManagementService.GetEventSpeakersAsync(eventId);
        return Ok(speakers);
    }

    private IActionResult MapError(EventResponse response) => MapErrorInternal(response.Errors, response);
    private IActionResult MapError(EventAttendeeResponse response) => MapErrorInternal(response.Errors, response);
    private IActionResult MapError(EventScheduleResponse response) => MapErrorInternal(response.Errors, response);
    private IActionResult MapError(EventSpeakerResponse response) => MapErrorInternal(response.Errors, response);
    private IActionResult MapError(EventSpeakerMapResponse response) => MapErrorInternal(response.Errors, response);

    private IActionResult MapErrorInternal(IEnumerable<string> errors, object response)
    {
        if (errors.Any(error => NotFoundErrors.Contains(error)))
            return NotFound(response);

        return BadRequest(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }
}
