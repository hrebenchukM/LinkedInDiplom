namespace Events.DataAccess.Entities;

public class EventSpeaker
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Title { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
