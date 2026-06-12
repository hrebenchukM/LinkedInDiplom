namespace Professional.DataAccess.Entities;

// Опыт работы пользователя
public class Experience
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Professional-модуль не зависел от Identity.DataAccess.
    public string UserId { get; set; } = default!;

    // Пока nullable, чтобы можно было добавить опыт без созданной компании.
    // Companies добавим позже.
    public Guid? CompanyId { get; set; }

    public string Position { get; set; } = default!;

    public string? EmploymentType { get; set; }

    public string? WorkLocationType { get; set; }

    public string? Location { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}