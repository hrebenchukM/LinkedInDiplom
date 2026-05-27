using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.UserVacancyFavorite;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;

namespace Jobs.Client.Resources;

public class UserVacancyFavoriteResource : IUserVacancyFavoriteResource
{
    private readonly IUserVacancyFavoriteService _favoriteService;

    public UserVacancyFavoriteResource(IUserVacancyFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    public Task<UserVacancyFavoriteResult> AddAsync(AddVacancyFavoriteParameters parameters)
    {
        return _favoriteService.AddAsync(parameters);
    }

    public Task<UserVacancyFavoriteResult> RemoveAsync(RemoveVacancyFavoriteParameters parameters)
    {
        return _favoriteService.RemoveAsync(parameters);
    }

    public Task<IReadOnlyCollection<UserVacancyFavoriteDto>> GetMyFavoritesAsync(GetMyVacancyFavoritesParameters parameters)
    {
        return _favoriteService.GetMyFavoritesAsync(parameters);
    }
}
