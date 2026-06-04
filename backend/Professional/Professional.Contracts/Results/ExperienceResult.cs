using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с опытом работы
public record ExperienceResult
{
    public bool Succeeded { get; init; }

    public ExperienceDto? Experience { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}