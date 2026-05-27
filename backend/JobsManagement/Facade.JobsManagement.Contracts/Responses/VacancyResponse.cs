using Facade.JobsManagement.Contracts.DTOs;

namespace Facade.JobsManagement.Contracts.Responses;

public record VacancyResponse
{
    public bool Success { get; init; }
    public VacancyDto? Vacancy { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
