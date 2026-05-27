namespace Jobs.Contracts.Parameters.UserVacancyFavorite;

public record RemoveVacancyFavoriteParameters
{
    public string UserId { get; init; } = default!;
    public Guid VacancyId { get; init; }
}
