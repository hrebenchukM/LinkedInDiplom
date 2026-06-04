namespace Professional.Contracts.Parameters.UserLanguage;

// Параметры для полного обновления языка пользователя
public record UpdateUserLanguageParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserLanguageId { get; init; }

    public Guid LanguageId { get; init; }

    public string? Level { get; init; }
}
