using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

public record SkillsResult
{
    public IReadOnlyCollection<SkillDto> Items { get; init; } = Array.Empty<SkillDto>();

    public int TotalCount { get; init; }
}
