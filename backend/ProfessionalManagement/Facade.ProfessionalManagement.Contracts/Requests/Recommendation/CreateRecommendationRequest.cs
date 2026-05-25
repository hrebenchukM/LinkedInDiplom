using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Recommendation;

// Запрос на создание рекомендации (получатель в UserId; автор из JWT)
public record CreateRecommendationRequest
{
    [Required]
    public string UserId { get; init; } = default!;

    [Required]
    public string Text { get; init; } = default!;
}
