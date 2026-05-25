using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для текстовых рекомендаций.
// В модульном монолите она обращается напрямую к IRecommendationService.
public class RecommendationResource : IRecommendationResource
{
    private readonly IRecommendationService _recommendationService;

    public RecommendationResource(IRecommendationService recommendationService)
    {
        _recommendationService = recommendationService;
    }

    public Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsForUserAsync(
        GetRecommendationsForUserParameters parameters)
    {
        return _recommendationService.GetRecommendationsForUserAsync(parameters);
    }

    public Task<RecommendationDto?> GetByIdAsync(GetRecommendationByIdParameters parameters)
    {
        return _recommendationService.GetByIdAsync(parameters);
    }

    public Task<RecommendationResult> CreateAsync(CreateRecommendationParameters parameters)
    {
        return _recommendationService.CreateAsync(parameters);
    }

    public Task<RecommendationResult> PatchAsync(PatchRecommendationParameters parameters)
    {
        return _recommendationService.PatchAsync(parameters);
    }

    public Task<RecommendationResult> DeleteAsync(DeleteRecommendationParameters parameters)
    {
        return _recommendationService.DeleteAsync(parameters);
    }
}
