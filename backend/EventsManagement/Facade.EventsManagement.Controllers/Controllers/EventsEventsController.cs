using Facade.EventsManagement.Contracts.DTOs;
using Facade.FileStorage.Contracts.Upload;
using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
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

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<EventDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> DiscoverEvents(
        [FromQuery] DiscoverEventsQueryRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();
        var events = await EventsService.DiscoverEventsAsync(currentUserId, request, cancellationToken);
        return Ok(events);
    }

    [Authorize]
    [HttpGet("me/attending")]
    [ProducesResponseType(typeof(PagedResponse<EventDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyAttendingEvents(
        [FromQuery] AttendingEventsQueryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var events = await EventsService.GetMyAttendingEventsAsync(userId, request, cancellationToken);
        return Ok(events);
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

        var item = await EventsService.GetEventByIdAsync(eventId, userId);
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

        var validationError = FileUploadValidation.Validate(
            file?.Length,
            FileUploadConstants.ImageMaxSizeBytes,
            FileUploadValidation.ImageTooLargeMessage);
        if (validationError != null)
            return MediaBadRequest(validationError);

        await using var stream = file!.OpenReadStream();

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
