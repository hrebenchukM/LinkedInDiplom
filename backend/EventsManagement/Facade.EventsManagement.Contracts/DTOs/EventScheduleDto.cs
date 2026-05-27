namespace Facade.EventsManagement.Contracts.DTOs;

public record EventScheduleDto
{
    public Guid Id { get; init; }
    public Guid EventId { get; init; }
    public string? TimeLabel { get; init; }
    public string Title { get; init; } = default!;
    public string? SpeakerName { get; init; }
    public int OrderIndex { get; init; }
    public DateTime CreatedAt { get; init; }
}
