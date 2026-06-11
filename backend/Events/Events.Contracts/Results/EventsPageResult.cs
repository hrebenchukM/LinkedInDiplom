using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventsPageResult
{
    public IReadOnlyCollection<EventDto> Items { get; init; } = Array.Empty<EventDto>();

    public int TotalCount { get; init; }
}
