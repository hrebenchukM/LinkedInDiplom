using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции со связью группы и поста
public record GroupPostResult
{
    public bool Succeeded { get; init; }

    public GroupPostDto? GroupPost { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
