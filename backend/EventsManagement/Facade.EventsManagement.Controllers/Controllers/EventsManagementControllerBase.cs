using System.Security.Claims;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.EventsManagement.Controllers.Controllers;

[ApiController]
[Route("api/events")]
/// <summary>
/// Базовый controller facade-слоя Events.
/// Нужен для общего маршрута модуля и консистентного преобразования ошибок в 400/404.
/// </summary>
public abstract class EventsManagementControllerBase : ControllerBase
{
    protected const string EventNotFoundError = "Event not found.";
    protected const string SpeakerNotFoundError = "Speaker not found.";

    private static readonly HashSet<string> NotFoundErrors = new(StringComparer.Ordinal)
    {
        "Event not found.",
        "Event attendee not found.",
        "Schedule item not found.",
        "Speaker not found.",
        "Event speaker not found."
    };

    protected IEventsManagementService EventsService { get; }

    protected EventsManagementControllerBase(IEventsManagementService eventsManagementService)
    {
        EventsService = eventsManagementService;
    }

    protected IActionResult MapError(EventResponse response) =>
        MapErrors(response, response.Errors, NotFoundErrors);

    protected IActionResult MapError(EventAttendeeResponse response) =>
        MapErrors(response, response.Errors, NotFoundErrors);

    protected IActionResult MapError(EventScheduleResponse response) =>
        MapErrors(response, response.Errors, NotFoundErrors);

    protected IActionResult MapError(EventSpeakerResponse response) =>
        MapErrors(response, response.Errors, NotFoundErrors);

    protected IActionResult MapError(EventSpeakerMapResponse response) =>
        MapErrors(response, response.Errors, NotFoundErrors);

    protected string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult NotFoundError(string message) =>
        NotFound(new { success = false, errors = new[] { message } });

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
