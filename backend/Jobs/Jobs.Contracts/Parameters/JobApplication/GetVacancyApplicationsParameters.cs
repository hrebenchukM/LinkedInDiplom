namespace Jobs.Contracts.Parameters.JobApplication;

public record GetVacancyApplicationsParameters
{
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
}
