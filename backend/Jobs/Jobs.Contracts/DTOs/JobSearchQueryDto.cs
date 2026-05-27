namespace Jobs.Contracts.DTOs;

public record JobSearchQueryDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = default!;
    public string? Query { get; init; }
    public string? Location { get; init; }
    public int? Radius { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
