using System.ComponentModel.DataAnnotations;

namespace Facade.AdminManagement.Contracts.Requests;

public record CreateRecommendedJobQueryRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Query { get; init; } = default!;
}
