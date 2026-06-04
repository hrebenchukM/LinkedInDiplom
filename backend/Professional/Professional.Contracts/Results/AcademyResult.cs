using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с учебным заведением
public record AcademyResult
{
    public bool Succeeded { get; init; }

    public AcademyDto? Academy { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
