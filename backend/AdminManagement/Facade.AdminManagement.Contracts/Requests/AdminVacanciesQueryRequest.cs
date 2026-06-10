using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.AdminManagement.Contracts.Requests;

public record AdminVacanciesQueryRequest : PagedRequest
{
    public Guid? CompanyId { get; init; }

    [StringLength(450)]
    public string? PostedByUserId { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    [StringLength(500)]
    public string? Search { get; init; }

    public DateTime? CreatedFrom { get; init; }

    public DateTime? CreatedTo { get; init; }

    [AllowedValues("createdAt", "updatedAt", "title", "companyId", "deletedAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
