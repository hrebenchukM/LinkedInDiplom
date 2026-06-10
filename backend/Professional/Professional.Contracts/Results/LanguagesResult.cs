using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

public record LanguagesResult
{
    public IReadOnlyCollection<LanguageDto> Items { get; init; } = Array.Empty<LanguageDto>();

    public int TotalCount { get; init; }
}
