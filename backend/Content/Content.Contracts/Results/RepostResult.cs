using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с репостом
public record RepostResult
{
    public bool Succeeded { get; init; }

    public RepostDto? Repost { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
