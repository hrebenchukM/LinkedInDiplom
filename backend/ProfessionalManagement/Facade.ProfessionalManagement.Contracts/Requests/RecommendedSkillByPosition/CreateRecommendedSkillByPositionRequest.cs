using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.RecommendedSkillByPosition;

// Запрос на добавление рекомендованного навыка к должности
public record CreateRecommendedSkillByPositionRequest
{
    [Required]
    [MaxLength(200)]
    public string Position { get; init; } = default!;

    [Required]
    public Guid SkillId { get; init; }
}
