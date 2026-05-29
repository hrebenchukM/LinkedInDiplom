using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;

namespace Profile.Contracts.Services;

// Интерфейс сервиса профилей
public interface IProfileService
{
    // Найти профиль по UserId
    Task<UserProfileDto?> GetAsync(GetProfileByUserIdParameters parameters);

    // Создать пустой профиль для нового пользователя
    Task<UserProfileDto> CreateEmptyAsync(string userId);

    // Обновить профиль
    Task<UserProfileDto> UpdateAsync(UserProfileDto profile);
}