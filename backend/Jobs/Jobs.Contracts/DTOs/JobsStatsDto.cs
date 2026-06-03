namespace Jobs.Contracts.DTOs;

public record JobsStatsDto
{
    public int TotalVacancies { get; init; }
    public int DeletedVacancies { get; init; }
    public int ActiveVacancies { get; init; }
    public int TotalRecommendedJobQueries { get; init; }
}
