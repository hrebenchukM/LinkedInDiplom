using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Recommendation;
using Facade.ProfessionalManagement.Contracts.Requests.RecommendedSkillByPosition;
using Facade.ProfessionalManagement.Contracts.Responses;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Parameters.RecommendedSkillByPosition;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    // Получить рекомендованные навыки для должности
    public async Task<IReadOnlyCollection<RecommendedSkillByPositionDto>> GetRecommendedSkillsByPositionAsync(
        string position)
    {
        var items = await _professionalClient.RecommendedSkillsByPosition.GetRecommendedSkillsByPositionAsync(
            new GetRecommendedSkillsByPositionParameters
            {
                Position = position
            });

        return items
            .Select(MapRecommendedSkillByPositionToFacadeDto)
            .ToList();
    }

    // Добавить рекомендованный навык к должности
    public async Task<RecommendedSkillByPositionResponse> CreateRecommendedSkillByPositionAsync(
        CreateRecommendedSkillByPositionRequest request)
    {
        var result = await _professionalClient.RecommendedSkillsByPosition.CreateAsync(
            new CreateRecommendedSkillByPositionParameters
            {
                Position = request.Position,
                SkillId = request.SkillId
            });

        return new RecommendedSkillByPositionResponse
        {
            Success = result.Succeeded,
            RecommendedSkillByPosition = result.RecommendedSkillByPosition == null
                ? null
                : MapRecommendedSkillByPositionToFacadeDto(result.RecommendedSkillByPosition),
            Errors = result.Errors
        };
    }

    // Удалить рекомендованный навык для должности
    public async Task<RecommendedSkillByPositionResponse> DeleteRecommendedSkillByPositionAsync(Guid rspId)
    {
        var result = await _professionalClient.RecommendedSkillsByPosition.DeleteAsync(
            new DeleteRecommendedSkillByPositionParameters
            {
                RspId = rspId
            });

        return new RecommendedSkillByPositionResponse
        {
            Success = result.Succeeded,
            RecommendedSkillByPosition = result.RecommendedSkillByPosition == null
                ? null
                : MapRecommendedSkillByPositionToFacadeDto(result.RecommendedSkillByPosition),
            Errors = result.Errors
        };
    }

    // Получить рекомендации для получателя (публичный список)
    public async Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsForUserAsync(string userId)
    {
        var recommendations = await _professionalClient.Recommendations.GetRecommendationsForUserAsync(
            new GetRecommendationsForUserParameters
            {
                UserId = userId
            });

        return recommendations
            .Select(MapRecommendationToFacadeDto)
            .ToList();
    }

    // Получить одну рекомендацию по Id (публичный)
    public async Task<RecommendationDto?> GetRecommendationByIdAsync(Guid recommendationId)
    {
        var recommendation = await _professionalClient.Recommendations.GetByIdAsync(
            new GetRecommendationByIdParameters
            {
                RecommendationId = recommendationId
            });

        return recommendation == null ? null : MapRecommendationToFacadeDto(recommendation);
    }

    // Создать рекомендацию (authorId из JWT)
    public async Task<RecommendationResponse> CreateRecommendationAsync(
        string authorId,
        CreateRecommendationRequest request)
    {
        var result = await _professionalClient.Recommendations.CreateAsync(
            new CreateRecommendationParameters
            {
                AuthorId = authorId,
                UserId = request.UserId,
                Text = request.Text
            });

        return new RecommendationResponse
        {
            Success = result.Succeeded,
            Recommendation = result.Recommendation == null
                ? null
                : MapRecommendationToFacadeDto(result.Recommendation),
            Errors = result.Errors
        };
    }

    // Обновить текст рекомендации (только автор)
    public async Task<RecommendationResponse> PatchRecommendationAsync(
        string authorId,
        Guid recommendationId,
        PatchRecommendationRequest request)
    {
        var result = await _professionalClient.Recommendations.PatchAsync(
            new PatchRecommendationParameters
            {
                AuthorId = authorId,
                RecommendationId = recommendationId,
                Text = request.Text
            });

        return new RecommendationResponse
        {
            Success = result.Succeeded,
            Recommendation = result.Recommendation == null
                ? null
                : MapRecommendationToFacadeDto(result.Recommendation),
            Errors = result.Errors
        };
    }

    // Soft delete рекомендации (только автор)
    public async Task<RecommendationResponse> DeleteRecommendationAsync(
        string authorId,
        Guid recommendationId)
    {
        var result = await _professionalClient.Recommendations.DeleteAsync(
            new DeleteRecommendationParameters
            {
                AuthorId = authorId,
                RecommendationId = recommendationId
            });

        return new RecommendationResponse
        {
            Success = result.Succeeded,
            Recommendation = result.Recommendation == null
                ? null
                : MapRecommendationToFacadeDto(result.Recommendation),
            Errors = result.Errors
        };
    }

    private static RecommendedSkillByPositionDto MapRecommendedSkillByPositionToFacadeDto(
        Professional.Contracts.DTOs.RecommendedSkillByPositionDto recommendedSkill)
    {
        return new RecommendedSkillByPositionDto
        {
            Id = recommendedSkill.Id,
            Position = recommendedSkill.Position,
            SkillId = recommendedSkill.SkillId,
            CreatedAt = recommendedSkill.CreatedAt,
            UpdatedAt = recommendedSkill.UpdatedAt
        };
    }

    private static RecommendationDto MapRecommendationToFacadeDto(
        Professional.Contracts.DTOs.RecommendationDto recommendation)
    {
        return new RecommendationDto
        {
            Id = recommendation.Id,
            AuthorId = recommendation.AuthorId,
            UserId = recommendation.UserId,
            Text = recommendation.Text,
            CreatedAt = recommendation.CreatedAt,
            UpdatedAt = recommendation.UpdatedAt
        };
    }
}
