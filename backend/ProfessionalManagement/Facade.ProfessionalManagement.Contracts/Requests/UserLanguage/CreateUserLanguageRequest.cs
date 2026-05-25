using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;

// Запрос на добавление языка текущему пользователю
public record CreateUserLanguageRequest
{
    [Required]
    public Guid LanguageId { get; init; }

    [MaxLength(100)]
    public string? Level { get; init; }
}
