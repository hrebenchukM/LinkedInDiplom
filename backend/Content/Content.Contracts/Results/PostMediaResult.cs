using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции со связью поста и медиа
public record PostMediaResult
{
    public bool Succeeded { get; init; }

    public PostMediaDto? PostMedia { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
