using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса текстовых рекомендаций между пользователями
public interface IRecommendationService
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
