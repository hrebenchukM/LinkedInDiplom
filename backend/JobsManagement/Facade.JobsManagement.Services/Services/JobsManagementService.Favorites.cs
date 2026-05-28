using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Responses;
using Jobs.Contracts.Parameters.UserVacancyFavorite;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
    public async Task<UserVacancyFavoriteResponse> AddFavoriteAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Favorites.AddAsync(new AddVacancyFavoriteParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return MapFavoriteResultToFacadeResponse(result);
    }

    public async Task<UserVacancyFavoriteResponse> RemoveFavoriteAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Favorites.RemoveAsync(new RemoveVacancyFavoriteParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return MapFavoriteResultToFacadeResponse(result);
    }

    public async Task<IReadOnlyCollection<UserVacancyFavoriteDto>> GetMyFavoritesAsync(string userId)
    {
        var favorites = await _jobsClient.Favorites.GetMyFavoritesAsync(new GetMyVacancyFavoritesParameters
        {
            UserId = userId
        });

        return favorites.Select(MapFavoriteToFacadeDto).ToList();
    }
}
