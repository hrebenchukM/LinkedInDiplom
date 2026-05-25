using Profile.Client.Contracts.Resources;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.ProfileView;
using Profile.Contracts.Results;
using Profile.Contracts.Services;

namespace Profile.Client.Resources;

// Реализация Resource для журнала просмотров профиля.
// В модульном монолите она обращается напрямую к IProfileViewService.
public class ProfileViewResource : IProfileViewResource
{
    private readonly IProfileViewService _profileViewService;

    public ProfileViewResource(IProfileViewService profileViewService)
    {
        _profileViewService = profileViewService;
    }

    public Task<ProfileViewResult> RecordProfileViewAsync(RecordProfileViewParameters parameters)
    {
        return _profileViewService.RecordProfileViewAsync(parameters);
    }

    public Task<IReadOnlyCollection<ProfileViewDto>> GetMyProfileViewsAsync(
        GetMyProfileViewsParameters parameters)
    {
        return _profileViewService.GetMyProfileViewsAsync(parameters);
    }
}
