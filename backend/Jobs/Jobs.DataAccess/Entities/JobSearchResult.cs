namespace Jobs.DataAccess.Entities;

public class JobSearchResult
{
    public Guid Id { get; set; }
    public Guid SearchId { get; set; }
    public Guid VacancyId { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
