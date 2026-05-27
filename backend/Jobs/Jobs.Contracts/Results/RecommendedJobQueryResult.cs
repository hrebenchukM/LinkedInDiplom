using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record RecommendedJobQueryResult
{
    public bool Succeeded { get; init; }
    public RecommendedJobQueryDto? RecommendedJobQuery { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
