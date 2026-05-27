namespace Facade.JobsManagement.Contracts.DTOs;

public record JobSearchResultDto
{
    public Guid Id { get; init; }
    public Guid SearchId { get; init; }
    public Guid VacancyId { get; init; }
    public int OrderIndex { get; init; }
    public DateTime CreatedAt { get; init; }
    public VacancyDto? Vacancy { get; init; }
}
