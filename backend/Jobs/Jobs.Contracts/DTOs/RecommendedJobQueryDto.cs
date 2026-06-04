namespace Jobs.Contracts.DTOs;

public record RecommendedJobQueryDto
{
    public Guid Id { get; init; }
    public string Query { get; init; } = default!;
    public DateTime CreatedAt { get; init; }
}
