using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с медиа
public record MediaResult
{
    public bool Succeeded { get; init; }

    public MediaDto? Media { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
