using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.RecommendedSkillByPosition;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса рекомендованных навыков по должности (глобальный справочник)
public interface IRecommendedSkillByPositionService
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
