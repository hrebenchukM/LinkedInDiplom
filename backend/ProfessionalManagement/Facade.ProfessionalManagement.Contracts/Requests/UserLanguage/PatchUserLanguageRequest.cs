namespace Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;

// Запрос на частичное обновление языка пользователя.
// Если поле null — значит его не меняем.
public record PatchUserLanguageRequest
{
    public Guid? LanguageId { get; init; }

    public string? Level { get; init; }
}
