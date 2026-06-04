namespace Jobs.Contracts.Parameters.Vacancy;

public record CreateVacancyParameters
{
    public string UserId { get; init; } = default!;
    public Guid CompanyId { get; init; }
    public string Title { get; init; } = default!;
    public string? JobType { get; init; }
    public string? Schedule { get; init; }
    public string? Location { get; init; }
    public decimal? SalaryFrom { get; init; }
    public decimal? SalaryTo { get; init; }
    public string? SalaryCurrency { get; init; }
    public string? Description { get; init; }
}
