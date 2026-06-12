namespace Jobs.DataAccess.Entities;

public class JobSearchQuery
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = default!;
    public string? Query { get; set; }
    public string? Location { get; set; }
    public int? Radius { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
