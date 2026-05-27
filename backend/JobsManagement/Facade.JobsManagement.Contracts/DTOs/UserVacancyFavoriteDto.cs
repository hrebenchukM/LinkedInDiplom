namespace Facade.JobsManagement.Contracts.DTOs;

public record UserVacancyFavoriteDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
    public DateTime CreatedAt { get; init; }
    public VacancyDto? Vacancy { get; init; }
}
