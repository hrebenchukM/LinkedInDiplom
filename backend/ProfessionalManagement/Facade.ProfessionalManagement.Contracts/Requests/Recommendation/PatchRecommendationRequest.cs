using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Recommendation;

// Запрос на обновление текста рекомендации (только Text)
public record PatchRecommendationRequest
{
    [Required]
    public string Text { get; init; } = default!;
}
