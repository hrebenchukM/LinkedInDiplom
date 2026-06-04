using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с постом
public record PostResult
{
    public bool Succeeded { get; init; }

    public PostDto? Post { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
