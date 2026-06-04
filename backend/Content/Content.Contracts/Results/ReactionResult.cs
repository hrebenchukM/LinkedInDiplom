using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с реакцией
public record ReactionResult
{
    public bool Succeeded { get; init; }

    public ReactionDto? Reaction { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
