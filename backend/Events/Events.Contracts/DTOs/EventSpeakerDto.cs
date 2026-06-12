namespace Events.Contracts.DTOs;

public record EventSpeakerDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = default!;
    public string? Title { get; init; }
    public string? AvatarUrl { get; init; }
    public DateTime CreatedAt { get; init; }
}
