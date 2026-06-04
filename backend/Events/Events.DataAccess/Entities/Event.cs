namespace Events.DataAccess.Entities;

public class Event
{
    public Guid Id { get; set; }
    public string OrganizerType { get; set; } = default!;
    public string OrganizerId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Location { get; set; }
    public bool IsOnline { get; set; }
    public string? ExternalLink { get; set; }
    public string? Timezone { get; set; }
    public string Visibility { get; set; } = default!;
    public bool AllowComments { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
