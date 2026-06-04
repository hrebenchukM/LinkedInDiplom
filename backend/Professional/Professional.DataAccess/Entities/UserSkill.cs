namespace Professional.DataAccess.Entities;

// Навык пользователя
public class UserSkill
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // Не делаем EF-связь на ApplicationUser,
    // чтобы Professional-модуль не зависел от Identity.DataAccess.
    public string UserId { get; set; } = default!;

    // Ссылка на справочник skills.
    public Guid SkillId { get; set; }

    public string? Level { get; set; }

    public bool IsMain { get; set; }

    public int OrderIndex { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
