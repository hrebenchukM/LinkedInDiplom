using System.ComponentModel.DataAnnotations;

namespace Facade.JobsManagement.Contracts.Requests.SearchQuery;

public record CreateJobSearchQueryRequest
{
    [StringLength(200)]
    public string? Query { get; init; }

    [StringLength(200)]
    public string? Location { get; init; }

    [Range(0, 1000)]
    public int? Radius { get; init; }
}
