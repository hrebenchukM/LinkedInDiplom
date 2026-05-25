using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для языков пользователя.
// В модульном монолите она обращается напрямую к IUserLanguageService.
public class UserLanguageResource : IUserLanguageResource
{
    private readonly IUserLanguageService _userLanguageService;

    public UserLanguageResource(IUserLanguageService userLanguageService)
    {
        _userLanguageService = userLanguageService;
    }

    public Task<IReadOnlyCollection<UserLanguageDto>> GetUserLanguagesAsync(
        GetUserLanguagesParameters parameters)
    {
        return _userLanguageService.GetUserLanguagesAsync(parameters);
    }

    public Task<UserLanguageDto?> GetByIdAsync(GetUserLanguageByIdParameters parameters)
    {
        return _userLanguageService.GetByIdAsync(parameters);
    }

    public Task<UserLanguageResult> CreateAsync(CreateUserLanguageParameters parameters)
    {
        return _userLanguageService.CreateAsync(parameters);
    }

    public Task<UserLanguageResult> UpdateAsync(UpdateUserLanguageParameters parameters)
    {
        return _userLanguageService.UpdateAsync(parameters);
    }

    public Task<UserLanguageResult> PatchAsync(PatchUserLanguageParameters parameters)
    {
        return _userLanguageService.PatchAsync(parameters);
    }

    public Task<UserLanguageResult> DeleteAsync(DeleteUserLanguageParameters parameters)
    {
        return _userLanguageService.DeleteAsync(parameters);
    }
}
