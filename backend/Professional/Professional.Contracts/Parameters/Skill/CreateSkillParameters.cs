namespace Professional.Contracts.Parameters.Skill;

// Создать навык в справочнике
public record CreateSkillParameters
{
    public string Name { get; init; } = default!;

    public string? Description { get; init; }
}
