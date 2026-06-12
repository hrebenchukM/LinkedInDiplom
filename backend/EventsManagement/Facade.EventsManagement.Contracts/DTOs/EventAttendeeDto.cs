namespace Facade.EventsManagement.Contracts.DTOs;

public record EventAttendeeDto
{
    public Guid Id { get; init; }
    public Guid EventId { get; init; }
    public string UserId { get; init; } = default!;
    public string Status { get; init; } = default!;
    public DateTime JoinedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
