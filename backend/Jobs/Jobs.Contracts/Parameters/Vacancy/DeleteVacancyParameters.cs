namespace Jobs.Contracts.Parameters.Vacancy;

public record DeleteVacancyParameters
{
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
}
