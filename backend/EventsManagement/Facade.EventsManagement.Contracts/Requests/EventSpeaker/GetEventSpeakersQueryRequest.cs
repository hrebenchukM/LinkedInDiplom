using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.EventsManagement.Contracts.Requests.EventSpeaker;

public record GetEventSpeakersQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Query { get; init; }
}
