namespace Jobs.Contracts.Parameters.UserVacancyFavorite;

public record AddVacancyFavoriteParameters
{
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
}
