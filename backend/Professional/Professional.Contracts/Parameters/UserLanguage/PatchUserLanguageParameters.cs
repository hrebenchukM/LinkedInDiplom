namespace Professional.Contracts.Parameters.UserLanguage;

// Параметры для частичного обновления языка пользователя.
// Если поле null — значит его не меняем.
public record PatchUserLanguageParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserLanguageId { get; init; }

    public Guid? LanguageId { get; init; }

    public string? Level { get; init; }
}
