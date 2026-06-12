using Facade.NotificationsManagement.Contracts.DTOs;

namespace Facade.NotificationsManagement.Contracts.Responses;

public record UserActivityResponse
{
    public bool Success { get; init; }
    public UserActivityDto? UserActivity { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
