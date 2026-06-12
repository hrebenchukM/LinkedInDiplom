namespace Content.Contracts.DTOs;

public record ContentStatsDto
{
    public int TotalPosts { get; init; }
    public int DeletedPosts { get; init; }
    public int ActivePosts { get; init; }
}
