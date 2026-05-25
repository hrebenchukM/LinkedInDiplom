using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с текстовыми рекомендациями между пользователями.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IRecommendationResource
{
    Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsForUserAsync(
        GetRecommendationsForUserParameters parameters);

    Task<RecommendationDto?> GetByIdAsync(
        GetRecommendationByIdParameters parameters);

    Task<RecommendationResult> CreateAsync(
        CreateRecommendationParameters parameters);

    Task<RecommendationResult> PatchAsync(
        PatchRecommendationParameters parameters);

    Task<RecommendationResult> DeleteAsync(
        DeleteRecommendationParameters parameters);
}
