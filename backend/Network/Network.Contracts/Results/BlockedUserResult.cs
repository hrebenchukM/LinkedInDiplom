using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с блокировкой пользователя
public record BlockedUserResult
{
    public bool Succeeded { get; init; }

    public BlockedUserDto? BlockedUser { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
