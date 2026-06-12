namespace Facade.AI.Contracts.Responses;

public class RecommendedJobsResponse
{
    public bool Success { get; set; }
    public IReadOnlyCollection<JobRecommendationItem> Recommendations { get; set; } = Array.Empty<JobRecommendationItem>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
}

public class JobRecommendationItem
{
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int MatchScore { get; set; }
}
