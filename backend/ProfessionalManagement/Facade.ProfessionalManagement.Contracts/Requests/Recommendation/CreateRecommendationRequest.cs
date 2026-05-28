using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Recommendation;

// Запрос на создание рекомендации (получатель в UserId; автор из JWT)
public record CreateRecommendationRequest
{
    [Required]
    [StringLength(100)]
    public string UserId { get; init; } = default!;

    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Text { get; init; } = default!;
}
