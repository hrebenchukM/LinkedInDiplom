using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.RecommendedSkillByPosition;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для рекомендованных навыков по должности.
// В модульном монолите она обращается напрямую к IRecommendedSkillByPositionService.
public class RecommendedSkillByPositionResource : IRecommendedSkillByPositionResource
{
    private readonly IRecommendedSkillByPositionService _recommendedSkillByPositionService;

    public RecommendedSkillByPositionResource(
        IRecommendedSkillByPositionService recommendedSkillByPositionService)
    {
        _recommendedSkillByPositionService = recommendedSkillByPositionService;
    }

    public Task<IReadOnlyCollection<RecommendedSkillByPositionDto>> GetRecommendedSkillsByPositionAsync(
        GetRecommendedSkillsByPositionParameters parameters)
    {
        return _recommendedSkillByPositionService.GetRecommendedSkillsByPositionAsync(parameters);
    }

    public Task<RecommendedSkillByPositionDto?> GetByIdAsync(
        GetRecommendedSkillByPositionByIdParameters parameters)
    {
        return _recommendedSkillByPositionService.GetByIdAsync(parameters);
    }

    public Task<RecommendedSkillByPositionResult> CreateAsync(
        CreateRecommendedSkillByPositionParameters parameters)
    {
        return _recommendedSkillByPositionService.CreateAsync(parameters);
    }

    public Task<RecommendedSkillByPositionResult> DeleteAsync(
        DeleteRecommendedSkillByPositionParameters parameters)
    {
        return _recommendedSkillByPositionService.DeleteAsync(parameters);
    }
}
