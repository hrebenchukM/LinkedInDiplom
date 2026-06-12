using Facade.JobsManagement.Contracts.DTOs;

namespace Facade.JobsManagement.Contracts.Responses;

public record JobSearchResultResponse
{
    public bool Success { get; init; }
    public JobSearchResultDto? SearchResult { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
