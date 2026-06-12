using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с подпиской
public record FollowResult
{
    public bool Succeeded { get; init; }

    public FollowDto? Follow { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
