namespace Professional.Contracts.Parameters.UserSkill;

// Параметры для получения навыков пользователя
public record GetUserSkillsParameters
{
    public string UserId { get; init; } = default!;
}
