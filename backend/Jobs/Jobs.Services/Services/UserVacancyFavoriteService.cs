using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.UserVacancyFavorite;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jobs.Services.Services;

public class UserVacancyFavoriteService(JobsDbContext dbContext) : IUserVacancyFavoriteService
{
    public async Task<UserVacancyFavoriteResult> AddAsync(AddVacancyFavoriteParameters parameters)
    {
        var vacancy = await dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == parameters.VacancyId && v.DeletedAt == null);

        if (vacancy is null)
        {
            return new UserVacancyFavoriteResult
            {
                Succeeded = false,
                Errors = ["Vacancy not found."]
            };
        }

        var favorite = await dbContext.UserVacancyFavorites
            .FirstOrDefaultAsync(f => f.UserId == parameters.UserId && f.VacancyId == parameters.VacancyId);

        if (favorite is not null && favorite.DeletedAt is null)
        {
            return new UserVacancyFavoriteResult
            {
                Succeeded = false,
                Errors = ["Vacancy already added to favorites."]
            };
        }

        if (favorite is not null)
        {
            favorite.DeletedAt = null;
            favorite.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            favorite = new UserVacancyFavorite
            {
                Id = Guid.NewGuid(),
                UserId = parameters.UserId,
                VacancyId = parameters.VacancyId,
                CreatedAt = DateTime.UtcNow,
                DeletedAt = null
            };

            dbContext.UserVacancyFavorites.Add(favorite);
        }

        await dbContext.SaveChangesAsync();

        return new UserVacancyFavoriteResult
        {
            Succeeded = true,
            UserVacancyFavorite = Map(favorite, vacancy)
        };
    }

    public async Task<UserVacancyFavoriteResult> RemoveAsync(RemoveVacancyFavoriteParameters parameters)
    {
        var favorite = await dbContext.UserVacancyFavorites
            .FirstOrDefaultAsync(f =>
                f.UserId == parameters.UserId &&
                f.VacancyId == parameters.VacancyId &&
                f.DeletedAt == null);

        if (favorite is null)
        {
            return new UserVacancyFavoriteResult
            {
                Succeeded = false,
                Errors = ["Favorite not found."]
            };
        }

        favorite.DeletedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        return new UserVacancyFavoriteResult
        {
            Succeeded = true,
            UserVacancyFavorite = Map(favorite, null)
        };
    }

    public async Task<IReadOnlyCollection<UserVacancyFavoriteDto>> GetMyFavoritesAsync(GetMyVacancyFavoritesParameters parameters)
    {
        var favorites = await dbContext.UserVacancyFavorites
            .AsNoTracking()
            .Where(f => f.UserId == parameters.UserId && f.DeletedAt == null)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        var vacancyIds = favorites.Select(f => f.VacancyId).Distinct().ToList();
        var vacancies = await dbContext.Vacancies
            .AsNoTracking()
            .Where(v => v.DeletedAt == null && vacancyIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => v);

        return favorites
            .Select(f =>
            {
                vacancies.TryGetValue(f.VacancyId, out var vacancy);
                return Map(f, vacancy);
            })
            .ToList();
    }

    private static UserVacancyFavoriteDto Map(UserVacancyFavorite favorite, Vacancy? vacancy) =>
        new()
        {
            Id = favorite.Id,
            UserId = favorite.UserId,
            VacancyId = favorite.VacancyId,
            CreatedAt = favorite.CreatedAt,
            Vacancy = vacancy is null ? null : MapVacancy(vacancy)
        };

    private static VacancyDto MapVacancy(Vacancy vacancy) =>
        new()
        {
            Id = vacancy.Id,
            CompanyId = vacancy.CompanyId,
            PostedBy = vacancy.PostedBy,
            Title = vacancy.Title,
            JobType = vacancy.JobType,
            Schedule = vacancy.Schedule,
            Location = vacancy.Location,
            SalaryFrom = vacancy.SalaryFrom,
            SalaryTo = vacancy.SalaryTo,
            SalaryCurrency = vacancy.SalaryCurrency,
            Description = vacancy.Description,
            PostedAt = vacancy.PostedAt,
            UpdatedAt = vacancy.UpdatedAt
        };
}
