namespace AI.Contracts.DTOs;

public record CareerAdviceDto
{
    public string Summary { get; init; } = default!;
    public IReadOnlyCollection<string> Strengths { get; init; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Improvements { get; init; } = Array.Empty<string>();
    public IReadOnlyCollection<string> SuggestedSkills { get; init; } = Array.Empty<string>();
}
