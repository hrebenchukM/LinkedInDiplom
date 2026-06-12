namespace Facade.JobsManagement.Contracts.DTOs;

public record JobApplicationDto
{
    public Guid Id { get; init; }
    public Guid VacancyId { get; init; }
    public string UserId { get; init; } = default!;
    public string Status { get; init; } = default!;
    public DateTime AppliedAt { get; init; }
    public DateTime? StatusChangedAt { get; init; }
    public DateTime? WithdrawnAt { get; init; }
    public VacancyDto? Vacancy { get; init; }
}
