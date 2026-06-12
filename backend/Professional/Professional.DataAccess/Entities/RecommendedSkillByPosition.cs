namespace Professional.DataAccess.Entities;

// Рекомендованный навык для должности (глобальный справочник, без user_id).
public class RecommendedSkillByPosition
{
    public Guid Id { get; set; }

    public string Position { get; set; } = default!;

    // Ссылка на skills.
    public Guid SkillId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
