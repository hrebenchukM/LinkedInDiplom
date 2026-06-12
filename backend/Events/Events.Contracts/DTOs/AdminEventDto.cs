namespace Events.Contracts.DTOs;

public record AdminEventDto
{
    public Guid Id { get; init; }

    public string OrganizerUserId { get; init; } = default!;

    public string Title { get; init; } = default!;

    public DateTime StartAt { get; init; }

    public DateTime? EndAt { get; init; }

    public string? Location { get; init; }

    public bool IsOnline { get; init; }

    public int AttendeeCount { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }

    public DateTime? DeletedAt { get; init; }

    public bool IsDeleted { get; init; }
}
