using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.RecommendedSkillByPosition;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с рекомендованными навыками по должности.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IRecommendedSkillByPositionResource
{
    Task<IReadOnlyCollection<RecommendedSkillByPositionDto>> GetRecommendedSkillsByPositionAsync(
        GetRecommendedSkillsByPositionParameters parameters);

    Task<RecommendedSkillByPositionDto?> GetByIdAsync(
        GetRecommendedSkillByPositionByIdParameters parameters);

    Task<RecommendedSkillByPositionResult> CreateAsync(
        CreateRecommendedSkillByPositionParameters parameters);

    Task<RecommendedSkillByPositionResult> DeleteAsync(
        DeleteRecommendedSkillByPositionParameters parameters);
}
