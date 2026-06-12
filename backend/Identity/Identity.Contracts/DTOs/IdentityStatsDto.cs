namespace Identity.Contracts.DTOs;

public record IdentityStatsDto
{
    public int TotalUsers { get; init; }
    public int DeletedUsers { get; init; }
    public int ActiveUsers { get; init; }
}
