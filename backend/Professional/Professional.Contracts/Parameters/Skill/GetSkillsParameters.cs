namespace Professional.Contracts.Parameters.Skill;

public record GetSkillsParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? Search { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
