using Notifications.Contracts.DTOs;

namespace Notifications.Contracts.Results;

public record NotificationResult
{
    public bool Succeeded { get; init; }
    public NotificationDto? Notification { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
