namespace Events.Contracts.DTOs;

public record EventSpeakerMapDto
{
    public Guid Id { get; init; }
    public Guid EventId { get; init; }
    public Guid SpeakerId { get; init; }
    public int OrderIndex { get; init; }
    public EventSpeakerDto? Speaker { get; init; }
}
