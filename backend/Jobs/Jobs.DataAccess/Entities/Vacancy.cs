namespace Jobs.DataAccess.Entities;

public class Vacancy
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string PostedBy { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? JobType { get; set; }
    public string? Schedule { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryFrom { get; set; }
    public decimal? SalaryTo { get; set; }
    public string? SalaryCurrency { get; set; }
    public string? Description { get; set; }
    public DateTime PostedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
