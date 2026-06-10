using AI.Contracts.Services;
using Facade.AI.Contracts.Responses;
using Facade.AI.Contracts.Services;

namespace Facade.AI.Services.Services;

public class AIManagementService : IAIManagementService
{
    private readonly IAIService _aiService;

    public AIManagementService(IAIService aiService)
    {
        _aiService = aiService;
    }

    public async Task<RecommendedJobsResponse> GetRecommendedJobsAsync(string userId)
    {
        try
        {
            var recommendations = await _aiService.GetRecommendedJobsAsync(userId);

            return new RecommendedJobsResponse
            {
                Success = true,
                Recommendations = recommendations.Select(r => new JobRecommendationItem
                {
                    Title = r.Title,
                    Description = r.Description,
                    MatchScore = r.MatchScore
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            return new RecommendedJobsResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }
    }

    public async Task<CareerAdviceResponse> GetCareerAdviceAsync(string userId)
    {
        try
        {
            var advice = await _aiService.GetCareerAdviceAsync(userId);

            return new CareerAdviceResponse
            {
                Success = true,
                Summary = advice.Summary,
                Strengths = advice.Strengths,
                Improvements = advice.Improvements,
                SuggestedSkills = advice.SuggestedSkills
            };
        }
        catch (Exception ex)
        {
            return new CareerAdviceResponse
            {
                Success = false,
                Summary = string.Empty,
                Errors = new[] { ex.Message }
            };
        }
    }
}
