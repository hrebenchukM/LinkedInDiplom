namespace Professional.Contracts.Parameters.UserSkill;

// Параметры для получения одного навыка пользователя
public record GetUserSkillByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserSkillId { get; init; }
}
