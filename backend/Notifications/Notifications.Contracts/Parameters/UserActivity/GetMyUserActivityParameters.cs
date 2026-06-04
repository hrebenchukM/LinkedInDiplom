namespace Notifications.Contracts.Parameters.UserActivity;

public record GetMyUserActivityParameters
{
    public string UserId { get; init; } = default!;
    public string? Action { get; init; }
    public int? Limit { get; init; }
}
