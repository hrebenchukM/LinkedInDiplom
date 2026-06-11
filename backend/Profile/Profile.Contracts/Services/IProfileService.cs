using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Results;

namespace Profile.Contracts.Services;

// Интерфейс сервиса профилей
public interface IProfileService
{
    // Найти профиль по UserId
    Task<UserProfileDto?> GetAsync(GetProfileByUserIdParameters parameters);

    // Поиск профилей для people search
    Task<SearchProfilesResult> SearchAsync(
        SearchProfilesParameters parameters,
        CancellationToken cancellationToken = default);

    // Создать пустой профиль для нового пользователя
    Task<UserProfileDto> CreateEmptyAsync(string userId);

    // Обновить профиль
    Task<UserProfileDto> UpdateAsync(UserProfileDto profile);
}