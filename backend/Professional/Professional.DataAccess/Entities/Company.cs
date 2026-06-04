namespace Professional.DataAccess.Entities;

// Компания в Professional-модуле
public class Company
{
    public Guid Id { get; set; }

    // Кто создал/владеет компанией.
    // Это Id пользователя из Identity.AspNetUsers.
    // EF-связь на Identity не делаем, чтобы не нарушать модульность.
    public string OwnerUserId { get; set; } = default!;

    public string Name { get; set; } = default!;

    public string? LogoUrl { get; set; }

    public string? Industry { get; set; }

    public string? Location { get; set; }

    public string? WebsiteUrl { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}