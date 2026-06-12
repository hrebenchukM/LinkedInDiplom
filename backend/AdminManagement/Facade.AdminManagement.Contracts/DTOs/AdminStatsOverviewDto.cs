namespace Facade.AdminManagement.Contracts.DTOs;

public record AdminStatsOverviewDto
{
    public int TotalUsers { get; init; }
    public int DeletedUsers { get; init; }
    public int ActiveUsers { get; init; }
    public int TotalPosts { get; init; }
    public int DeletedPosts { get; init; }
    public int ActivePosts { get; init; }
    public int TotalVacancies { get; init; }
    public int DeletedVacancies { get; init; }
    public int ActiveVacancies { get; init; }
    public int TotalRecommendedJobQueries { get; init; }
    public int TotalEvents { get; init; }
    public int DeletedEvents { get; init; }
    public int ActiveEvents { get; init; }
    public int UpcomingEvents { get; init; }
}
