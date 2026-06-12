using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса языков пользователя
public interface IUserLanguageService
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
