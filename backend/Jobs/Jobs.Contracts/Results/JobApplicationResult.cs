using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record JobApplicationResult
{
    public bool Succeeded { get; init; }
    public JobApplicationDto? JobApplication { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
