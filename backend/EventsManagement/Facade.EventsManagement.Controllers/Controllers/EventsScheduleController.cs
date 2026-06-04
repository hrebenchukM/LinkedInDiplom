using Facade.EventsManagement.Contracts.Requests.EventSchedule;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.EventsManagement.Controllers.Controllers;

public class EventsScheduleController : EventsManagementControllerBase
{
    public EventsScheduleController(IEventsManagementService eventsManagementService)
        : base(eventsManagementService)
    {
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

        var response = await EventsService.CreateScheduleItemAsync(userId, eventId, request);
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

        var schedule = await EventsService.GetEventScheduleAsync(eventId);
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

        var response = await EventsService.UpdateScheduleItemAsync(userId, eventId, scheduleId, request);
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

        var response = await EventsService.DeleteScheduleItemAsync(userId, eventId, scheduleId);
        if (!response.Success)
            return MapError(response);

        return Ok(response);
    }
}
