namespace Content.DataAccess.Entities;

// Хэштег.
public class Hashtag
{
    public Guid Id { get; set; }

    public string Name { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
