namespace Jobs.Contracts.Parameters.JobApplication;

public record ApplyToVacancyParameters
{
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
}
