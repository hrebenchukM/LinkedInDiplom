namespace Professional.Contracts.Parameters.UserSkill;

// Параметры для частичного обновления навыка пользователя.
// Если поле null — значит его не меняем.
public record PatchUserSkillParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserSkillId { get; init; }

    public Guid? SkillId { get; init; }

    public string? Level { get; init; }

    public bool? IsMain { get; init; }

    public int? OrderIndex { get; init; }
}
