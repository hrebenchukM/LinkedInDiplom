namespace Professional.Contracts.Parameters.RecommendedSkillByPosition;

// Параметры для получения рекомендованных навыков по должности
public record GetRecommendedSkillsByPositionParameters
{
    public string Position { get; init; } = default!;
}
