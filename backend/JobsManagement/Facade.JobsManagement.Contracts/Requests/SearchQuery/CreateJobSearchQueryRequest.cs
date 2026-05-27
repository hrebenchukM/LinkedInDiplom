namespace Facade.JobsManagement.Contracts.Requests.SearchQuery;

public record CreateJobSearchQueryRequest
{
    public string? Query { get; init; }
    public string? Location { get; init; }
    public int? Radius { get; init; }
}
