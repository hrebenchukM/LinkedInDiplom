using Facade.ProfileManagement.Contracts.DTOs;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Profile.Client.Contracts.Services;
using Profile.Contracts.DTOs;

namespace Facade.ProfileManagement.Services.Services;

// Фасадный сервис для работы с профилем.
// Теперь он обращается к Profile.API через HTTP-клиент.
public class ProfileManagementService : IProfileManagementService
{
    private readonly IProfileClient _profileClient;

    public ProfileManagementService(IProfileClient profileClient)
    {
        _profileClient = profileClient;
    }

    // Получить мой профиль
    public async Task<ProfileDto?> GetMyProfileAsync(string userId)
    {
        var profile = await _profileClient.GetByUserIdAsync(userId);

        return profile == null ? null : MapToFacadeDto(profile);
    }

    // Получить профиль по UserId
    public async Task<ProfileDto?> GetProfileByUserIdAsync(string userId)
    {
        var profile = await _profileClient.GetByUserIdAsync(userId);

        return profile == null ? null : MapToFacadeDto(profile);
    }

    // Обновить мой профиль
    public async Task<ProfileResponse> UpdateMyProfileAsync(string userId, UpdateMyProfileRequest request)
    {
        var profileToUpdate = new UserProfileDto
        {
            UserId = userId,

            FirstName = request.FirstName,
            LastName = request.LastName,
            AvatarUrl = request.AvatarUrl,
            HeaderUrl = request.HeaderUrl,
            ProfileTitle = request.ProfileTitle,
            Headline = request.Headline,
            GenInfo = request.GenInfo,
            University = request.University,
            Location = request.Location,
            PortfolioUrl = request.PortfolioUrl,
            IsCompany = request.IsCompany
        };

        var updatedProfile = await _profileClient.UpdateByUserIdAsync(userId, profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }

    private static ProfileDto MapToFacadeDto(UserProfileDto profile)
    {
        return new ProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,

            FirstName = profile.FirstName,
            LastName = profile.LastName,
            FullName = profile.FullName,

            AvatarUrl = profile.AvatarUrl,
            HeaderUrl = profile.HeaderUrl,

            ProfileTitle = profile.ProfileTitle,
            Headline = profile.Headline,
            GenInfo = profile.GenInfo,

            University = profile.University,
            Location = profile.Location,
            PortfolioUrl = profile.PortfolioUrl,

            IsCompany = profile.IsCompany,

            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };
    }


    public async Task<ProfileResponse> UploadMyAvatarAsync(
    string userId,
    Stream fileStream,
    string fileName,
    string contentType)
    {
        var updatedProfile = await _profileClient.UploadAvatarAsync(
            userId,
            fileStream,
            fileName,
            contentType);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }

    public async Task<ProfileResponse> UploadMyHeaderAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var updatedProfile = await _profileClient.UploadHeaderAsync(
            userId,
            fileStream,
            fileName,
            contentType);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }
}