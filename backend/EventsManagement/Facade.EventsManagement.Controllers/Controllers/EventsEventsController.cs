using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.EventsManagement.Controllers.Controllers;

public class EventsEventsController : EventsManagementControllerBase
{
    public EventsEventsController(IEventsManagementService eventsManagementService)
        : base(eventsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me")]
    [ProducesResponseType(typeof(EventResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await EventsService.CreateEventAsync(userId, request);
        if (!response.Success)
        {
            return MapError(response);
        }

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
        {
            return Unauthorized();
        }

        var items = await EventsService.GetMyEventsAsync(userId, limit, fromStartAt, toStartAt);
        return Ok(items);
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
        {
            return Unauthorized();
        }

        var item = await EventsService.GetEventByIdAsync(eventId);
        if (item is null)
        {
            return NotFoundError(EventNotFoundError);
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPatch("me/{eventId:guid}")]
    [ProducesResponseType(typeof(EventResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateEvent(Guid eventId, [FromBody] UpdateEventRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await EventsService.UpdateEventAsync(userId, eventId, request);
        if (!response.Success)
        {
            return MapError(response);
        }

        return Ok(response);
    }

    // POST api/events/me/{eventId}/cover
    [Authorize]
    [HttpPost("me/{eventId:guid}/cover")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(EventResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UploadEventCover(
        Guid eventId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
            return MediaBadRequest("File is empty.");
        if (file.Length > 5 * 1024 * 1024)
            return MediaBadRequest("File is too large. Maximum size is 5 MB.");

        await using var stream = file.OpenReadStream();

        var response = await EventsService.UploadEventCoverAsync(
            userId,
            eventId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
        {
            return MapError(response);
        }

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
        {
            return Unauthorized();
        }

        var response = await EventsService.DeleteEventAsync(userId, eventId);
        if (!response.Success)
        {
            return MapError(response);
        }

        return Ok(response);
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
