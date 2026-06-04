using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с подписчиком страницы
public record PageFollowerResult
{
    public bool Succeeded { get; init; }

    public PageFollowerDto? PageFollower { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
