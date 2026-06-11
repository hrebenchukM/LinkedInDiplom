namespace Events.Contracts.DTOs;

public record EventsStatsDto
{
    public int TotalEvents { get; init; }

    public int DeletedEvents { get; init; }

    public int ActiveEvents { get; init; }

    public int UpcomingEvents { get; init; }
}
