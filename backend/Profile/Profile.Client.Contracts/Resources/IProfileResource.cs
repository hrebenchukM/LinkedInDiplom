using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Results;

namespace Profile.Client.Contracts.Resources;

// Resource для работы с Profile-модулем.
// Это внутренняя точка доступа фасада к Profile.
public interface IProfileResource
{
    // Найти профиль по UserId
    Task<UserProfileDto?> GetAsync(GetProfileByUserIdParameters parameters);

    // Поиск профилей
    Task<SearchProfilesResult> SearchAsync(
        SearchProfilesParameters parameters,
        CancellationToken cancellationToken = default);

    // Создать пустой профиль
    Task<UserProfileDto> CreateEmptyAsync(string userId);

    // Обновить профиль
    Task<UserProfileDto> UpdateAsync(UserProfileDto profile);
}