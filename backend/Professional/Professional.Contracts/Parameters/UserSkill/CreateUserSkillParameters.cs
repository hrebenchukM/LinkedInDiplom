namespace Professional.Contracts.Parameters.UserSkill;

// Параметры для добавления навыка пользователю
public record CreateUserSkillParameters
{
    public string UserId { get; init; } = default!;

    public Guid SkillId { get; init; }

    public string? Level { get; init; }

    public bool IsMain { get; init; }

    public int OrderIndex { get; init; }
}
