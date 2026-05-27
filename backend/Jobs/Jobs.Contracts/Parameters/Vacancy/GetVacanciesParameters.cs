namespace Jobs.Contracts.Parameters.Vacancy;

public record GetVacanciesParameters
{
    public string UserId { get; init; } = default!;
    public Guid? CompanyId { get; init; }
    public string? Query { get; init; }
    public string? Location { get; init; }
}
