namespace Professional.DataAccess.Entities;

// Навык в глобальном справочнике Professional-модуля
public class Skill
{
    public Guid Id { get; set; }

    public string Name { get; set; } = default!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
