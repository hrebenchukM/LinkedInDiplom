using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Media;

// Запрос на регистрацию медиа (только Url и Type)
public record CreateMediaRequest
{
    [Required]
    public string Url { get; init; } = default!;

    [Required]
    public string Type { get; init; } = default!;
}
