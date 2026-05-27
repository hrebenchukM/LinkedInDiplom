namespace Facade.NotificationsManagement.Contracts.Requests.UserActivity;

public record CreateUserActivityRequest
{
    public string Action { get; init; } = default!;
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public string? Meta { get; init; }
}
