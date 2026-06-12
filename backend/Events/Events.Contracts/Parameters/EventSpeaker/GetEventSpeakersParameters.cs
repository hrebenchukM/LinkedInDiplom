namespace Events.Contracts.Parameters.EventSpeaker;

public record GetEventSpeakersParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? Query { get; init; }
}
