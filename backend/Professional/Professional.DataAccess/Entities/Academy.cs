namespace Professional.DataAccess.Entities;

// Учебное заведение в справочнике Professional-модуля
public class Academy
{
    public Guid Id { get; set; }

    public string Name { get; set; } = default!;

    public string? LogoUrl { get; set; }

    public string? WebsiteUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
