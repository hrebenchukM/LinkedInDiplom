using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции со связью поста и хэштега
public record PostHashtagResult
{
    public bool Succeeded { get; init; }

    public PostHashtagDto? PostHashtag { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
