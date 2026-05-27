namespace Jobs.DataAccess.Entities;

public class UserVacancyFavorite
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = default!;
    public Guid VacancyId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}
