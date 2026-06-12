using Profile.Client.Contracts.Resources;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Results;
using Profile.Contracts.Services;

namespace Profile.Client.Resources;

/// <summary>
/// Resource-адаптер для ProfileClient.
/// Сейчас вызывает core service напрямую, но контракт уже отделён от реализации.
/// </summary>
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

    public Task<SearchProfilesResult> SearchAsync(
        SearchProfilesParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return _profileService.SearchAsync(parameters, cancellationToken);
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