namespace Content.DataAccess.Entities;

// Медиа-ресурс (URL/reference, без blob в БД).
public class Media
{
    public Guid Id { get; set; }

    public string Url { get; set; } = default!;

    public string Type { get; set; } = default!;

    public DateTime CreatedAt { get; set; }
}
