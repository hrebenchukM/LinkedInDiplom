namespace Events.DataAccess.Entities;

public class EventSpeakerMap
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid SpeakerId { get; set; }
    public int OrderIndex { get; set; }
}
