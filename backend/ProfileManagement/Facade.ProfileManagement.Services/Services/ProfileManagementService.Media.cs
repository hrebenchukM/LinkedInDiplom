using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Upload;
using Facade.ProfileManagement.Contracts.Responses;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    public async Task<ProfileResponse> UploadMyAvatarAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var oldAvatarUrl = existingProfile?.AvatarUrl;

        var avatarUrl = await SaveProfileImageAsync(
            userId,
            fileStream,
            fileName,
            contentType,
            "avatar");

        var profileToUpdate = existingProfile ?? new UserProfileDto
        {
            UserId = userId
        };

        profileToUpdate = profileToUpdate with
        {
            AvatarUrl = avatarUrl
        };

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(profileToUpdate);

        await _fileStorageService.DeleteAsync(oldAvatarUrl);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapProfileToFacadeDto(updatedProfile)
        };
    }

    public async Task<ProfileResponse> UploadMyHeaderAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var oldHeaderUrl = existingProfile?.HeaderUrl;

        var headerUrl = await SaveProfileImageAsync(
            userId,
            fileStream,
            fileName,
            contentType,
            "header");

        var profileToUpdate = existingProfile ?? new UserProfileDto
        {
            UserId = userId
        };

        profileToUpdate = profileToUpdate with
        {
            HeaderUrl = headerUrl
        };

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(profileToUpdate);

        await _fileStorageService.DeleteAsync(oldHeaderUrl);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapProfileToFacadeDto(updatedProfile)
        };
    }

    public async Task<ProfileResponse> DeleteMyAvatarAsync(string userId)
    {
        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        if (existingProfile == null)
        {
            return new ProfileResponse
            {
                Success = false,
                Errors = ["Profile not found."]
            };
        }

        var oldAvatarUrl = existingProfile.AvatarUrl;

        if (string.IsNullOrWhiteSpace(oldAvatarUrl))
        {
            return new ProfileResponse
            {
                Success = true,
                Profile = MapProfileToFacadeDto(existingProfile)
            };
        }

        await _fileStorageService.DeleteAsync(oldAvatarUrl);

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(
            existingProfile with { AvatarUrl = null });

        return new ProfileResponse
        {
            Success = true,
            Profile = MapProfileToFacadeDto(updatedProfile)
        };
    }

    public async Task<ProfileResponse> DeleteMyHeaderAsync(string userId)
    {
        var existingProfile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        if (existingProfile == null)
        {
            return new ProfileResponse
            {
                Success = false,
                Errors = ["Profile not found."]
            };
        }

        var oldHeaderUrl = existingProfile.HeaderUrl;

        if (string.IsNullOrWhiteSpace(oldHeaderUrl))
        {
            return new ProfileResponse
            {
                Success = true,
                Profile = MapProfileToFacadeDto(existingProfile)
            };
        }

        await _fileStorageService.DeleteAsync(oldHeaderUrl);

        var updatedProfile = await _profileClient.Profiles.UpdateAsync(
            existingProfile with { HeaderUrl = null });

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
                AllowedExtensions = FileUploadConstants.ProfileImageExtensions,
                AllowedContentTypes = FileUploadConstants.ProfileImageContentTypes,
                MaxFileSizeBytes = FileUploadConstants.ImageMaxSizeBytes
            });
    }
}
