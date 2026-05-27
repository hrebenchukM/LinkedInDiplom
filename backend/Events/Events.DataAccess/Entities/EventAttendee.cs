namespace Events.DataAccess.Entities;

public class EventAttendee
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string UserId { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime JoinedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
