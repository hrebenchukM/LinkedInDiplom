using System.ComponentModel.DataAnnotations;

namespace Facade.JobsManagement.Contracts.Requests.Vacancy;

public record CreateVacancyRequest
{
    [Required]
    public Guid CompanyId { get; init; }

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; init; } = default!;

    [StringLength(100)]
    public string? JobType { get; init; }
    [StringLength(100)]
    public string? Schedule { get; init; }
    [StringLength(200)]
    public string? Location { get; init; }
    [Range(0, double.MaxValue)]
    public decimal? SalaryFrom { get; init; }
    [Range(0, double.MaxValue)]
    public decimal? SalaryTo { get; init; }
    [StringLength(10)]
    public string? SalaryCurrency { get; init; }
    [StringLength(4000)]
    public string? Description { get; init; }
}
