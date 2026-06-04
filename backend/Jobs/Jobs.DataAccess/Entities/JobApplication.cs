namespace Jobs.DataAccess.Entities;

public class JobApplication
{
    public Guid Id { get; set; }
    public Guid VacancyId { get; set; }
    public string UserId { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime AppliedAt { get; set; }
    public DateTime? StatusChangedAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }
}
