using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventSpeakersPageResult
{
    public IReadOnlyCollection<EventSpeakerDto> Items { get; init; } = Array.Empty<EventSpeakerDto>();

    public int TotalCount { get; init; }
}
