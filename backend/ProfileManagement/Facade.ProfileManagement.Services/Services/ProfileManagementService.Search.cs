using Facade.ProfileManagement.Contracts.DTOs;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.Shared.Contracts.Pagination;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    public async Task<PagedResponse<ProfileSearchResultDto>> SearchProfilesAsync(
        ProfileSearchQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _profileClient.Profiles.SearchAsync(
            new SearchProfilesParameters
            {
                Query = request.Query,
                Location = request.Location,
                Skip = skip,
                Take = pageSize
            },
            cancellationToken);

        var items = result.Items
            .Select(MapSearchToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    private static ProfileSearchResultDto MapSearchToFacadeDto(ProfileSearchItemDto profile)
    {
        return new ProfileSearchResultDto
        {
            UserId = profile.UserId,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            DisplayName = profile.DisplayName,
            Headline = profile.Headline,
            Location = profile.Location,
            AvatarUrl = profile.AvatarUrl,
            HeaderUrl = profile.HeaderUrl
        };
    }
}
