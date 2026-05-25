namespace Professional.Contracts.Parameters.RecommendedSkillByPosition;

// Параметры для добавления рекомендованного навыка к должности
public record CreateRecommendedSkillByPositionParameters
{
    public string Position { get; init; } = default!;

    public Guid SkillId { get; init; }
}
