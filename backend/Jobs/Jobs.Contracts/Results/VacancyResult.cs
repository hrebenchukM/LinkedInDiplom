using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record VacancyResult
{
    public bool Succeeded { get; init; }
    public VacancyDto? Vacancy { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
