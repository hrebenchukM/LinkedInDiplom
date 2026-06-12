using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record AdminVacanciesResult
{
    public IReadOnlyCollection<AdminVacancyDto> Items { get; init; } = Array.Empty<AdminVacancyDto>();

    public int TotalCount { get; init; }
}
