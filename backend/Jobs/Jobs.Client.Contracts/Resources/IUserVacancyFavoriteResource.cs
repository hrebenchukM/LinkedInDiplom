using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.UserVacancyFavorite;
using Jobs.Contracts.Results;

namespace Jobs.Client.Contracts.Resources;

public interface IUserVacancyFavoriteResource
{
    Task<UserVacancyFavoriteResult> AddAsync(AddVacancyFavoriteParameters parameters);
    Task<UserVacancyFavoriteResult> RemoveAsync(RemoveVacancyFavoriteParameters parameters);
    Task<IReadOnlyCollection<UserVacancyFavoriteDto>> GetMyFavoritesAsync(GetMyVacancyFavoritesParameters parameters);
}
