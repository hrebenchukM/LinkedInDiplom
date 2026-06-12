namespace Jobs.DataAccess.Entities;

public class RecommendedJobQuery
{
    public Guid Id { get; set; }
    public string Query { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
