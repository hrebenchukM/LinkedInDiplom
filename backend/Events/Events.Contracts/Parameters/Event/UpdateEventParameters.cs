namespace Events.Contracts.Parameters.Event;

public record UpdateEventParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
    public string OrganizerType { get; init; } = default!;
    public string Title { get; init; } = default!;
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public string? Location { get; init; }
    public bool IsOnline { get; init; }
    public string? ExternalLink { get; init; }
    public string? Timezone { get; init; }
    public string? Visibility { get; init; }
    public bool? AllowComments { get; init; }
    public DateTime StartAt { get; init; }
    public DateTime? EndAt { get; init; }
}
