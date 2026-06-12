using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record VacanciesPageResult
{
    public IReadOnlyCollection<VacancyDto> Items { get; init; } = Array.Empty<VacancyDto>();

    public int TotalCount { get; init; }
}
