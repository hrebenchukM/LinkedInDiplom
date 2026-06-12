namespace Professional.Contracts.Parameters.UserSkill;

// Параметры для полного обновления навыка пользователя
public record UpdateUserSkillParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserSkillId { get; init; }

    public Guid SkillId { get; init; }

    public string? Level { get; init; }

    public bool IsMain { get; init; }

    public int OrderIndex { get; init; }
}
