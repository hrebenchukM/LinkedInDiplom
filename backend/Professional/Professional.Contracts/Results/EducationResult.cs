using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с образованием
public record EducationResult
{
    public bool Succeeded { get; init; }

    public EducationDto? Education { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
