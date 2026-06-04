namespace Events.Contracts.DTOs;

public record EventDto
{
    public Guid Id { get; init; }
    public string OrganizerType { get; init; } = default!;
    public string OrganizerId { get; init; } = default!;
    public string Title { get; init; } = default!;
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public string? Location { get; init; }
    public bool IsOnline { get; init; }
    public string? ExternalLink { get; init; }
    public string? Timezone { get; init; }
    public string Visibility { get; init; } = default!;
    public bool AllowComments { get; init; }
    public DateTime StartAt { get; init; }
    public DateTime? EndAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
