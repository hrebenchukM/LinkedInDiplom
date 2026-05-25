namespace Professional.DataAccess.Entities;

// Образование пользователя
public class Education
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Professional-модуль не зависел от Identity.DataAccess.
    public string UserId { get; set; } = default!;

    // Ссылка на справочник academies; nullable, если указан только institution.
    public Guid? AcademyId { get; set; }

    public string Institution { get; set; } = default!;

    public string? Degree { get; set; }

    public string? FieldOfStudy { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? Source { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
