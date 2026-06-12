namespace Professional.DataAccess.Entities;

// Язык пользователя
public class UserLanguage
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Professional-модуль не зависел от Identity.DataAccess.
    public string UserId { get; set; } = default!;

    // Ссылка на справочник languages.
    public Guid LanguageId { get; set; }

    public string? Level { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
