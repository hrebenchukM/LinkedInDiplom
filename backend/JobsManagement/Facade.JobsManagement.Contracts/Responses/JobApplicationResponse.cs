using Facade.JobsManagement.Contracts.DTOs;

namespace Facade.JobsManagement.Contracts.Responses;

public record JobApplicationResponse
{
    public bool Success { get; init; }
    public JobApplicationDto? Application { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
