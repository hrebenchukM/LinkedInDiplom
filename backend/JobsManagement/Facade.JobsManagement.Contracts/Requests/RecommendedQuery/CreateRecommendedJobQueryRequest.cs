using System.ComponentModel.DataAnnotations;

namespace Facade.JobsManagement.Contracts.Requests.RecommendedQuery;

public record CreateRecommendedJobQueryRequest
{
    [Required]
    public string Query { get; init; } = default!;
}
