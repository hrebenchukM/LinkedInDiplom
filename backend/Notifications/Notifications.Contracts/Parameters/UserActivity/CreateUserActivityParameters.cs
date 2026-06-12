namespace Notifications.Contracts.Parameters.UserActivity;

public record CreateUserActivityParameters
{
    public string UserId { get; init; } = default!;
    public string Action { get; init; } = default!;
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public string? Meta { get; init; }
}
