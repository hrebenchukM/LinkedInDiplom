using Profile.Client.Contracts.Resources;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Services;

namespace Profile.Client.Resources;

// Реализация Resource для Profile.
// В модульном монолите она обращается напрямую к IProfileService.
public class ProfileResource : IProfileResource
{
    private readonly IProfileService _profileService;

    public ProfileResource(IProfileService profileService)
    {
        _profileService = profileService;
    }

    public Task<UserProfileDto?> GetAsync(GetProfileByUserIdParameters parameters)
    {
        return _profileService.GetAsync(parameters);
    }

    public Task<UserProfileDto> CreateEmptyAsync(string userId)
    {
        return _profileService.CreateEmptyAsync(userId);
    }

    public Task<UserProfileDto> UpdateAsync(UserProfileDto profile)
    {
        return _profileService.UpdateAsync(profile);
    }
}