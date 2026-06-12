namespace Professional.Contracts.Parameters.RecommendedSkillByPosition;

// Параметры для получения одной рекомендации навыка по должности
public record GetRecommendedSkillByPositionByIdParameters
{
    public Guid RspId { get; init; }
}
