namespace Professional.Contracts.Parameters.UserLanguage;

// Параметры для удаления языка пользователя
public record DeleteUserLanguageParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserLanguageId { get; init; }
}
