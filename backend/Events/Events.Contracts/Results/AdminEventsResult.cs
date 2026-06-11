using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record AdminEventsResult
{
    public IReadOnlyCollection<AdminEventDto> Items { get; init; } = Array.Empty<AdminEventDto>();

    public int TotalCount { get; init; }
}
