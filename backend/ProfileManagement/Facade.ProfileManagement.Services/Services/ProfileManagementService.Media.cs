using Facade.FileStorage.Contracts;
using Facade.ProfileManagement.Contracts.Responses;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    private static readonly string[] ProfileImageExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private static readonly string[] ProfileImageContentTypes = { "image/jpeg", "image/png", "image/webp" };

    // Загрузить аватар моего профиля
    public async Task<ProfileResponse> UploadMyAvatarAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var avatarUrl = await SaveProfileImageAsync(
            userId,
            fileStream,
            fileName,
            contentType,
            "avatar");

        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var profileToUpdate = existingProfile ?? new UserProfileDto
        {
            UserId = userId
        };

        profileToUpdate = profileToUpdate with
        {
            AvatarUrl = avatarUrl
        };

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapProfileToFacadeDto(updatedProfile)
        };
    }

    // Загрузить header моего профиля
    public async Task<ProfileResponse> UploadMyHeaderAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var headerUrl = await SaveProfileImageAsync(
            userId,
            fileStream,
            fileName,
            contentType,
            "header");

        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var profileToUpdate = existingProfile ?? new UserProfileDto
        {
            UserId = userId
        };

        profileToUpdate = profileToUpdate with
        {
            HeaderUrl = headerUrl
        };

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapProfileToFacadeDto(updatedProfile)
        };
    }

    private Task<string> SaveProfileImageAsync(
        string userId,
        Stream fileStream,
        string originalFileName,
        string contentType,
        string entityName)
    {
        return _fileStorageService.SaveAsync(
            fileStream,
            originalFileName,
            contentType,
            new FileStoragePathOptions
            {
                ModuleName = "profile",
                EntityName = entityName,
                OwnerId = userId,
                AllowedExtensions = ProfileImageExtensions,
                AllowedContentTypes = ProfileImageContentTypes
            });
    }
}
