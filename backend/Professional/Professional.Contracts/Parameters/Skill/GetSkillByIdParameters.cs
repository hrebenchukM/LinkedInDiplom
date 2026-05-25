namespace Professional.Contracts.Parameters.Skill;

// Получить навык по Id
public record GetSkillByIdParameters
{
    public Guid SkillId { get; init; }
}
