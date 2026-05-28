using Facade.ProfileManagement.Contracts.DTOs;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Responses;
using Profile.Contracts.Parameters;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    // Получить мой профиль
    public async Task<ProfileDto?> GetMyProfileAsync(string userId)
    {
        var profile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        if (profile != null)
            return MapToFacadeDto(profile);

        try
        {
            var createdProfile = await _profileClient.Profiles.CreateEmptyAsync(userId);
            return MapToFacadeDto(createdProfile);
        }
        catch (InvalidOperationException)
        {
            // Soft-deleted профиль не восстанавливаем автоматически без отдельного подтверждения.
            return null;
        }
    }

    // Получить профиль по UserId
    public async Task<ProfileDto?> GetProfileByUserIdAsync(string userId)
    {
        var profile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        return profile == null ? null : MapToFacadeDto(profile);
    }

    // Обновить мой профиль.
    // Если поле в запросе null — сохраняем текущее значение (partial PUT).
    public async Task<ProfileResponse> UpdateMyProfileAsync(string userId, UpdateMyProfileRequest request)
    {
        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        if (existingProfile == null)
        {
            existingProfile = await _profileClient.Profiles.CreateEmptyAsync(userId);
        }

        var profileToUpdate = existingProfile with
        {
            FirstName = request.FirstName ?? existingProfile.FirstName,
            LastName = request.LastName ?? existingProfile.LastName,

            ProfileTitle = request.ProfileTitle ?? existingProfile.ProfileTitle,
            Headline = request.Headline ?? existingProfile.Headline,
            GenInfo = request.GenInfo ?? existingProfile.GenInfo,

            University = request.University ?? existingProfile.University,
            Location = request.Location ?? existingProfile.Location,
            PortfolioUrl = request.PortfolioUrl ?? existingProfile.PortfolioUrl,

            IsCompany = request.IsCompany ?? existingProfile.IsCompany,

            // Аватар и header не меняем через обычный PUT,
            // они меняются только через upload endpoints.
            AvatarUrl = existingProfile.AvatarUrl,
            HeaderUrl = existingProfile.HeaderUrl
        };

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }

    // Частично обновить мой профиль
    public async Task<ProfileResponse> PatchMyProfileAsync(string userId, PatchMyProfileRequest request)
    {
        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        if (existingProfile == null)
        {
            existingProfile = await _profileClient.Profiles.CreateEmptyAsync(userId);
        }

        var profileToUpdate = existingProfile with
        {
            FirstName = request.FirstName ?? existingProfile.FirstName,
            LastName = request.LastName ?? existingProfile.LastName,

            ProfileTitle = request.ProfileTitle ?? existingProfile.ProfileTitle,
            Headline = request.Headline ?? existingProfile.Headline,
            GenInfo = request.GenInfo ?? existingProfile.GenInfo,

            University = request.University ?? existingProfile.University,
            Location = request.Location ?? existingProfile.Location,
            PortfolioUrl = request.PortfolioUrl ?? existingProfile.PortfolioUrl,

            IsCompany = request.IsCompany ?? existingProfile.IsCompany,

            // Аватар и header через PATCH не трогаем.
            AvatarUrl = existingProfile.AvatarUrl,
            HeaderUrl = existingProfile.HeaderUrl
        };

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }
}
