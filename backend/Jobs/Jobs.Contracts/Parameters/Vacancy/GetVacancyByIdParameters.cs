namespace Jobs.Contracts.Parameters.Vacancy;

public record GetVacancyByIdParameters
{
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
}
