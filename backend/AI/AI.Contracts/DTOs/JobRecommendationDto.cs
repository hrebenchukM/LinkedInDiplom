namespace AI.Contracts.DTOs;

public record JobRecommendationDto
{
    public string Title { get; init; } = default!;
    public string Description { get; init; } = default!;
    public int MatchScore { get; init; }
}
