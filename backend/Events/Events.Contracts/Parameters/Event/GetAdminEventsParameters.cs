namespace Events.Contracts.Parameters.Event;

public record GetAdminEventsParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? OrganizerUserId { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    public string? Query { get; init; }

    public DateTime? FromStartAt { get; init; }

    public DateTime? ToStartAt { get; init; }

    public string? Location { get; init; }

    public bool? IsOnline { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
