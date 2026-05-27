using Facade.JobsManagement.Contracts.DTOs;

namespace Facade.JobsManagement.Contracts.Responses;

public record RecommendedJobQueryResponse
{
    public bool Success { get; init; }
    public RecommendedJobQueryDto? RecommendedQuery { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
