using Facade.JobsManagement.Contracts.DTOs;

namespace Facade.JobsManagement.Contracts.Responses;

public record JobSearchQueryResponse
{
    public bool Success { get; init; }
    public JobSearchQueryDto? SearchQuery { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
