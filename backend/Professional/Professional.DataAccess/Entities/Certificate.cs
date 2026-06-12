namespace Professional.DataAccess.Entities;

// Сертификат пользователя
public class Certificate
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Professional-модуль не зависел от Identity.DataAccess.
    public string UserId { get; set; } = default!;

    // Ссылка на справочник academies; nullable.
    public Guid? AcademyId { get; set; }

    public string Name { get; set; } = default!;

    public string? DownloadRef { get; set; }

    public DateOnly IssueDate { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public string? AccreditationId { get; set; }

    public string? OrganizationUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
