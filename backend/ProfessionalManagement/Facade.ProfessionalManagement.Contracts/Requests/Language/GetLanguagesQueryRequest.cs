using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.ProfessionalManagement.Contracts.Requests.Language;

public record GetLanguagesQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Search { get; init; }

    [AllowedValues("name", "createdAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
