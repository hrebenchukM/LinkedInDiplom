using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с хэштегом
public record HashtagResult
{
    public bool Succeeded { get; init; }

    public HashtagDto? Hashtag { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
