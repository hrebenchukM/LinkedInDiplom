using Notifications.Contracts.DTOs;

namespace Notifications.Contracts.Results;

public record UserActivityResult
{
    public bool Succeeded { get; init; }
    public UserActivityDto? UserActivity { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
