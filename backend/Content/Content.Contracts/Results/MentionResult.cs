using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с упоминанием
public record MentionResult
{
    public bool Succeeded { get; init; }

    public MentionDto? Mention { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
