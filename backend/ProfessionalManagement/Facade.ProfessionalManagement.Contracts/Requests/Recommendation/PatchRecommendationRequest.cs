using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Recommendation;

// Запрос на обновление текста рекомендации (только Text)
public record PatchRecommendationRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Text { get; init; } = default!;
}
