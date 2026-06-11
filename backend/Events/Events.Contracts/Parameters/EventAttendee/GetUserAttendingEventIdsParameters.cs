namespace Events.Contracts.Parameters.EventAttendee;

public record GetUserAttendingEventIdsParameters
{
    public string UserId { get; init; } = default!;
}
