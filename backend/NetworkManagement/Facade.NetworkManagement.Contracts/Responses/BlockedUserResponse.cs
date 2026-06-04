using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с блокировкой
public record BlockedUserResponse
{
    public bool Success { get; init; }

    public BlockedUserDto? BlockedUser { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
