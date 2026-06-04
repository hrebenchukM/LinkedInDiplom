namespace Profile.DataAccess.Entities;

// Настройки сообщений пользователя (одна запись на user_id).
public class MessageSettings
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Profile-модуль не зависел от Identity.DataAccess.
    public string UserId { get; set; } = default!;

    public bool OfficeAbsenceEnabled { get; set; }

    public string? OfficeAbsenceMessage { get; set; }

    public bool NotificationsEnabled { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
