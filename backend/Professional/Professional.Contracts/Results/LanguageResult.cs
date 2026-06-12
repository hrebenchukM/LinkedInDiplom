using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с языком в справочнике
public record LanguageResult
{
    public bool Succeeded { get; init; }

    public LanguageDto? Language { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
