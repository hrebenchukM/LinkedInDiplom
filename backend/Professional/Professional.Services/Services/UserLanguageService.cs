using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с языками пользователя
public class UserLanguageService : IUserLanguageService
{
    private readonly ProfessionalDbContext _dbContext;

    public UserLanguageService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить все языки пользователя
    public async Task<IReadOnlyCollection<UserLanguageDto>> GetUserLanguagesAsync(
        GetUserLanguagesParameters parameters)
    {
        var userLanguages = await _dbContext.UserLanguages
            .AsNoTracking()
            .Where(ul => ul.UserId == parameters.UserId)
            .OrderByDescending(ul => ul.CreatedAt)
            .ToListAsync();

        return userLanguages
            .Select(MapToDto)
            .ToList();
    }

    // Получить один язык пользователя по Id
    public async Task<UserLanguageDto?> GetByIdAsync(GetUserLanguageByIdParameters parameters)
    {
        var userLanguage = await _dbContext.UserLanguages
            .AsNoTracking()
            .FirstOrDefaultAsync(ul =>
                ul.Id == parameters.UserLanguageId &&
                ul.UserId == parameters.UserId);

        return userLanguage == null ? null : MapToDto(userLanguage);
    }

    // Добавить язык пользователю
    public async Task<UserLanguageResult> CreateAsync(CreateUserLanguageParameters parameters)
    {
        if (!await LanguageExistsAsync(parameters.LanguageId))
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "Language not found." }
            };
        }

        if (await UserHasLanguageAsync(parameters.UserId, parameters.LanguageId))
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "Language already added." }
            };
        }

        var userLanguage = new UserLanguage
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            LanguageId = parameters.LanguageId,
            Level = parameters.Level,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.UserLanguages.Add(userLanguage);
        await _dbContext.SaveChangesAsync();

        return new UserLanguageResult
        {
            Succeeded = true,
            UserLanguage = MapToDto(userLanguage)
        };
    }

    // Полностью обновить язык пользователя
    public async Task<UserLanguageResult> UpdateAsync(UpdateUserLanguageParameters parameters)
    {
        var userLanguage = await _dbContext.UserLanguages
            .FirstOrDefaultAsync(ul =>
                ul.Id == parameters.UserLanguageId &&
                ul.UserId == parameters.UserId);

        if (userLanguage == null)
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "User language not found." }
            };
        }

        if (!await LanguageExistsAsync(parameters.LanguageId))
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "Language not found." }
            };
        }

        if (await UserHasLanguageAsync(
                parameters.UserId,
                parameters.LanguageId,
                parameters.UserLanguageId))
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "Language already added." }
            };
        }

        userLanguage.LanguageId = parameters.LanguageId;
        userLanguage.Level = parameters.Level;
        userLanguage.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new UserLanguageResult
        {
            Succeeded = true,
            UserLanguage = MapToDto(userLanguage)
        };
    }

    // Частично обновить язык пользователя
    public async Task<UserLanguageResult> PatchAsync(PatchUserLanguageParameters parameters)
    {
        var userLanguage = await _dbContext.UserLanguages
            .FirstOrDefaultAsync(ul =>
                ul.Id == parameters.UserLanguageId &&
                ul.UserId == parameters.UserId);

        if (userLanguage == null)
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "User language not found." }
            };
        }

        if (parameters.LanguageId.HasValue)
        {
            if (!await LanguageExistsAsync(parameters.LanguageId.Value))
            {
                return new UserLanguageResult
                {
                    Succeeded = false,
                    Errors = new[] { "Language not found." }
                };
            }

            if (await UserHasLanguageAsync(
                    parameters.UserId,
                    parameters.LanguageId.Value,
                    parameters.UserLanguageId))
            {
                return new UserLanguageResult
                {
                    Succeeded = false,
                    Errors = new[] { "Language already added." }
                };
            }
        }

        userLanguage.LanguageId = parameters.LanguageId ?? userLanguage.LanguageId;
        userLanguage.Level = parameters.Level ?? userLanguage.Level;
        userLanguage.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new UserLanguageResult
        {
            Succeeded = true,
            UserLanguage = MapToDto(userLanguage)
        };
    }

    // Удалить язык пользователя
    public async Task<UserLanguageResult> DeleteAsync(DeleteUserLanguageParameters parameters)
    {
        var userLanguage = await _dbContext.UserLanguages
            .FirstOrDefaultAsync(ul =>
                ul.Id == parameters.UserLanguageId &&
                ul.UserId == parameters.UserId);

        if (userLanguage == null)
        {
            return new UserLanguageResult
            {
                Succeeded = false,
                Errors = new[] { "User language not found." }
            };
        }

        _dbContext.UserLanguages.Remove(userLanguage);
        await _dbContext.SaveChangesAsync();

        return new UserLanguageResult
        {
            Succeeded = true,
            UserLanguage = MapToDto(userLanguage)
        };
    }

    private async Task<bool> LanguageExistsAsync(Guid languageId)
    {
        return await _dbContext.Languages
            .AsNoTracking()
            .AnyAsync(l => l.Id == languageId);
    }

    private async Task<bool> UserHasLanguageAsync(
        string userId,
        Guid languageId,
        Guid? excludeUserLanguageId = null)
    {
        return await _dbContext.UserLanguages
            .AsNoTracking()
            .AnyAsync(ul =>
                ul.UserId == userId &&
                ul.LanguageId == languageId &&
                (excludeUserLanguageId == null || ul.Id != excludeUserLanguageId));
    }

    private static UserLanguageDto MapToDto(UserLanguage userLanguage)
    {
        return new UserLanguageDto
        {
            Id = userLanguage.Id,
            UserId = userLanguage.UserId,
            LanguageId = userLanguage.LanguageId,
            Level = userLanguage.Level,
            CreatedAt = userLanguage.CreatedAt,
            UpdatedAt = userLanguage.UpdatedAt
        };
    }
}
