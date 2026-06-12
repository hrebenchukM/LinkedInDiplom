namespace Facade.JobsManagement.Contracts.DTOs;

public record VacancyDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string PostedBy { get; init; } = default!;
    public string Title { get; init; } = default!;
    public string? JobType { get; init; }
    public string? Schedule { get; init; }
    public string? Location { get; init; }
    public decimal? SalaryFrom { get; init; }
    public decimal? SalaryTo { get; init; }
    public string? SalaryCurrency { get; init; }
    public string? Description { get; init; }
    public DateTime PostedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
