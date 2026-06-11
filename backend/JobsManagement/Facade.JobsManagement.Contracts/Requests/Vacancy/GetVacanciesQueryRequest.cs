using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.JobsManagement.Contracts.Requests.Vacancy;

public record GetVacanciesQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Query { get; init; }

    [StringLength(200)]
    public string? Search { get; init; }

    public Guid? CompanyId { get; init; }

    [StringLength(450)]
    public string? PostedByUserId { get; init; }

    [StringLength(500)]
    public string? Location { get; init; }

    [StringLength(100)]
    public string? EmploymentType { get; init; }

    [StringLength(100)]
    public string? Schedule { get; init; }

    public DateTime? FromCreatedAt { get; init; }

    public DateTime? ToCreatedAt { get; init; }

    [AllowedValues("createdAt", "title", "companyId", "location", "updatedAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
