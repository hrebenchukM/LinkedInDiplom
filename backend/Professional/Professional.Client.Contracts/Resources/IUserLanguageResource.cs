using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с языками пользователя.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IUserLanguageResource
{
    Task<IReadOnlyCollection<UserLanguageDto>> GetUserLanguagesAsync(
        GetUserLanguagesParameters parameters);

    Task<UserLanguageDto?> GetByIdAsync(
        GetUserLanguageByIdParameters parameters);

    Task<UserLanguageResult> CreateAsync(
        CreateUserLanguageParameters parameters);

    Task<UserLanguageResult> UpdateAsync(
        UpdateUserLanguageParameters parameters);

    Task<UserLanguageResult> PatchAsync(
        PatchUserLanguageParameters parameters);

    Task<UserLanguageResult> DeleteAsync(
        DeleteUserLanguageParameters parameters);
}
