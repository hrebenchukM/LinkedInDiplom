using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с подпиской пользователя на хэштег
public record UserHashtagFollowResult
{
    public bool Succeeded { get; init; }

    public UserHashtagFollowDto? UserHashtagFollow { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
