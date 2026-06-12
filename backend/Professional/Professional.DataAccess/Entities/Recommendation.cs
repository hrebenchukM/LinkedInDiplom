namespace Professional.DataAccess.Entities;

// Текстовая рекомендация одного пользователя другому (author → recipient).
public class Recommendation
{
    public Guid Id { get; set; }

    // Id автора из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Professional-модуль не зависел от Identity.DataAccess.
    public string AuthorId { get; set; } = default!;

    // Id получателя рекомендации из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public string Text { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
