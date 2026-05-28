using FacadeProfileViewDto = Facade.ProfileManagement.Contracts.DTOs.ProfileViewDto;
using Facade.ProfileManagement.Contracts.Responses;
using Profile.Contracts.Parameters.ProfileView;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    public async Task<ProfileViewResponse> RecordProfileViewAsync(
        string profileOwnerId,
        string? viewerUserId,
        string viewerIp,
        string? viewerUserAgent,
        string? source)
    {
        var result = await _profileClient.ProfileViews.RecordProfileViewAsync(
            new RecordProfileViewParameters
            {
                ProfileOwnerId = profileOwnerId,
                ViewerUserId = viewerUserId,
                ViewerIp = viewerIp,
                ViewerUserAgent = viewerUserAgent,
                Source = source
            });

        return new ProfileViewResponse
        {
            Success = result.Succeeded,
            ProfileView = result.ProfileView == null
                ? null
                : MapProfileViewToFacadeDto(result.ProfileView),
            Errors = result.Errors
        };
    }

    public async Task<IReadOnlyCollection<FacadeProfileViewDto>> GetMyProfileViewsAsync(string userId)
    {
        var views = await _profileClient.ProfileViews.GetMyProfileViewsAsync(
            new GetMyProfileViewsParameters
            {
                ProfileOwnerId = userId
            });

        return views.Select(MapProfileViewToFacadeDto).ToList();
    }
}
