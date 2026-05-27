namespace Events.DataAccess.Entities;

public class EventScheduleItem
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string? TimeLabel { get; set; }
    public string Title { get; set; } = default!;
    public string? SpeakerName { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
}
