using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record JobSearchQueryResult
{
    public bool Succeeded { get; init; }
    public JobSearchQueryDto? JobSearchQuery { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
