namespace Jobs.Contracts.Parameters.UserVacancyFavorite;

public record GetMyVacancyFavoritesParameters
{
    public string UserId { get; init; } = default!;
}
