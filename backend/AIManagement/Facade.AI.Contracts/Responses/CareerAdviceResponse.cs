namespace Facade.AI.Contracts.Responses;

public class CareerAdviceResponse
{
    public bool Success { get; set; }
    public string Summary { get; set; } = default!;
    public IReadOnlyCollection<string> Strengths { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> Improvements { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> SuggestedSkills { get; set; } = Array.Empty<string>();
    public IEnumerable<string> Errors { get; set; } = Array.Empty<string>();
}
