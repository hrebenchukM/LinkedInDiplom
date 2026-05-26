using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с группой
public record UserGroupResult
{
    public bool Succeeded { get; init; }

    public UserGroupDto? UserGroup { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
