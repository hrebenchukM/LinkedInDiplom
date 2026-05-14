using Microsoft.EntityFrameworkCore;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.DataAccess.Entities;

namespace Profile.Services.Services;

// Сервис для работы с профилями пользователей
public class ProfileService : IProfileService
{
    // DbContext — доступ к таблицам Profile-модуля
    private readonly ProfileDbContext _dbContext;

    // Через конструктор получаем ProfileDbContext из DI
    public ProfileService(ProfileDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить профиль пользователя по UserId
    public async Task<UserProfileDto?> GetAsync(GetProfileByUserIdParameters parameters)
    {
        // Ищем профиль в таблице user_profiles без отслеживания изменений
        var profile = await _dbContext.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.UserId == parameters.UserId &&
                p.DeletedAt == null);

        // Если профиль не найден — возвращаем null
        if (profile == null)
            return null;

        // Если найден — превращаем UserProfile в UserProfileDto
        return MapToDto(profile);
    }

    // Создать пустой профиль для нового пользователя
    public async Task<UserProfileDto> CreateEmptyAsync(string userId)
    {
        // Проверяем, есть ли уже профиль у этого пользователя
        var existingProfile = await _dbContext.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.DeletedAt == null);

        // Если профиль уже есть — просто возвращаем его
        if (existingProfile != null)
            return MapToDto(existingProfile);

        // Создаём новый пустой профиль
        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Добавляем профиль в таблицу
        _dbContext.UserProfiles.Add(profile);

        // Сохраняем изменения в БД
        await _dbContext.SaveChangesAsync();

        // Возвращаем DTO
        return MapToDto(profile);
    }

    // Обновить профиль пользователя
    public async Task<UserProfileDto> UpdateAsync(UserProfileDto profileDto)
    {
        // Ищем профиль в базе по UserId
        var profile = await _dbContext.UserProfiles
            .FirstOrDefaultAsync(p =>
                p.UserId == profileDto.UserId &&
                p.DeletedAt == null);

        // Если профиля ещё нет — создаём новый
        if (profile == null)
        {
            profile = new UserProfile
            {
                Id = Guid.NewGuid(),
                UserId = profileDto.UserId,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.UserProfiles.Add(profile);
        }

        // Обновляем профильные поля
        profile.FirstName = profileDto.FirstName;
        profile.LastName = profileDto.LastName;
        profile.AvatarUrl = profileDto.AvatarUrl;
        profile.HeaderUrl = profileDto.HeaderUrl;
        profile.ProfileTitle = profileDto.ProfileTitle;
        profile.Headline = profileDto.Headline;
        profile.GenInfo = profileDto.GenInfo;
        profile.University = profileDto.University;
        profile.Location = profileDto.Location;
        profile.PortfolioUrl = profileDto.PortfolioUrl;
        profile.IsCompany = profileDto.IsCompany;
        profile.UpdatedAt = DateTime.UtcNow;

        // Сохраняем изменения
        await _dbContext.SaveChangesAsync();

        // Возвращаем обновлённый профиль
        return MapToDto(profile);
    }

    // Превращаем UserProfile в UserProfileDto
    // Это нужно, чтобы наружу отдавать безопасную модель профиля
    private static UserProfileDto MapToDto(UserProfile profile)
    {
        return new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,

            FirstName = profile.FirstName,
            LastName = profile.LastName,
            FullName = $"{profile.FirstName} {profile.LastName}".Trim(),

            AvatarUrl = profile.AvatarUrl,
            HeaderUrl = profile.HeaderUrl,

            ProfileTitle = profile.ProfileTitle,
            Headline = profile.Headline,
            GenInfo = profile.GenInfo,

            University = profile.University,
            Location = profile.Location,
            PortfolioUrl = profile.PortfolioUrl,

            IsCompany = profile.IsCompany,

            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };
    }
}