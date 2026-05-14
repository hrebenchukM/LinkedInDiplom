namespace Identity.Events.Contracts.Events;

public record UserRegisteredEvent
{
    public string UserId { get; init; } = default!;
    public string UserName { get; init; } = default!;
    public string Email { get; init; } = default!;
    public DateTime RegisteredAt { get; init; }
}
