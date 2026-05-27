namespace Content.DataAccess.Entities;

// Сохранённый пост пользователя.
public class SavedPost
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public Guid PostId { get; set; }

    public DateTime SavedAt { get; set; }

    public DateTime? UnsavedAt { get; set; }
}
