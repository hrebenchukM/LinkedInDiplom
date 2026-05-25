using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;

// Запрос на полное обновление языка пользователя
public record UpdateUserLanguageRequest
{
    [Required]
    public Guid LanguageId { get; init; }

    [MaxLength(100)]
    public string? Level { get; init; }
}
