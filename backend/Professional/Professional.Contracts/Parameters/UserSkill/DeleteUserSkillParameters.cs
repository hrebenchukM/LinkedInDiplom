namespace Professional.Contracts.Parameters.UserSkill;

// Параметры для удаления навыка пользователя
public record DeleteUserSkillParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserSkillId { get; init; }
}
