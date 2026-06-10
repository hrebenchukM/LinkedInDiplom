using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

public record AcademiesResult
{
    public IReadOnlyCollection<AcademyDto> Items { get; init; } = Array.Empty<AcademyDto>();

    public int TotalCount { get; init; }
}
