using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Media;

// Запрос на регистрацию медиа (только Url и Type)
public record CreateMediaRequest
{
    [Required]
    [Url]
    [StringLength(2000, MinimumLength = 1)]
    public string Url { get; init; } = default!;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Type { get; init; } = default!;
}
