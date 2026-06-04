using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;

// Запрос на частичное обновление языка пользователя.
// Если поле null — значит его не меняем.
public record PatchUserLanguageRequest
{
    public Guid? LanguageId { get; init; }

    [MaxLength(100)]
    public string? Level { get; init; }
}
