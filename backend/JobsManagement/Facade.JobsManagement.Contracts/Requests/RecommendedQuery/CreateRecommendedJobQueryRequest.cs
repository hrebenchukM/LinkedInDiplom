using System.ComponentModel.DataAnnotations;

namespace Facade.JobsManagement.Contracts.Requests.RecommendedQuery;

public record CreateRecommendedJobQueryRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Query { get; init; } = default!;
}
