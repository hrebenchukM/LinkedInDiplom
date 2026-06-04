using Facade.ProfileManagement.Contracts.Responses;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    // Загрузить аватар моего профиля
    public async Task<ProfileResponse> UploadMyAvatarAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType)
    {
        var avatarUrl = await SaveProfileFileAsync(
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
        var headerUrl = await SaveProfileFileAsync(
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

    // Сохраняем файл в uploads/profile/{userId}/avatar или header.
    // В Docker эта папка будет подключена к volume profile_uploads.
    private async Task<string> SaveProfileFileAsync(
      string userId,
      Stream fileStream,
      string originalFileName,
      string contentType,
      string folderName)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" };

        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            throw new InvalidOperationException("Only jpg, jpeg, png and webp files are allowed.");

        if (!allowedContentTypes.Contains(contentType.ToLowerInvariant()))
            throw new InvalidOperationException("Only jpg, jpeg, png and webp files are allowed.");

        var userFolder = Path.Combine(_uploadsOptions.RootPath, "profile", userId, folderName);

        if (!Directory.Exists(userFolder))
        {
            Directory.CreateDirectory(userFolder);
        }

        var newFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(userFolder, newFileName);

        await using var outputStream = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(outputStream);

        return $"/uploads/profile/{userId}/{folderName}/{newFileName}";
    }
}
