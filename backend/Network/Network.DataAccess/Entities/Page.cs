namespace Network.DataAccess.Entities;

// Страница (бренд, компания и т.п.).
public class Page
{
    public Guid Id { get; set; }

    // Id владельца из Identity.AspNetUsers.
    public string OwnerId { get; set; } = default!;

    public string Name { get; set; } = default!;

    public string? Description { get; set; }

    public string? LogoUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
