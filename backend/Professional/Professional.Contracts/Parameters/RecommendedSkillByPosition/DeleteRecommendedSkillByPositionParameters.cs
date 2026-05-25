namespace Professional.Contracts.Parameters.RecommendedSkillByPosition;

// Параметры для удаления рекомендованного навыка для должности
public record DeleteRecommendedSkillByPositionParameters
{
    public Guid RspId { get; init; }
}
