using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.AdminManagement.Contracts.Requests;

public record AdminPostsQueryRequest : PagedRequest, IValidatableObject
{
    [StringLength(450)]
    public string? AuthorId { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    [StringLength(500)]
    public string? Search { get; init; }

    public DateTime? CreatedFrom { get; init; }

    public DateTime? CreatedTo { get; init; }

    [AllowedValues("createdAt", "updatedAt", "authorId", "deletedAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (CreatedFrom.HasValue && CreatedTo.HasValue && CreatedFrom > CreatedTo)
        {
            yield return new ValidationResult(
                "CreatedFrom must be less than or equal to CreatedTo.",
                [nameof(CreatedFrom), nameof(CreatedTo)]);
        }
    }
}
