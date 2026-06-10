using Amazon.S3.Model;
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

    // Сохраняем файл в S3 (если настроен bucket) или локально в uploads/profile/{userId}/avatar|header.
    // В Docker локальная папка будет подключена к volume profile_uploads.
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

        var newFileName = $"{Guid.NewGuid()}{extension}";

        if (!string.IsNullOrWhiteSpace(_s3Settings.BucketName) && _s3Client != null)
        {
            return await SaveProfileFileToS3Async(
                fileStream,
                contentType,
                userId,
                folderName,
                newFileName);
        }

        var userFolder = Path.Combine(_uploadsOptions.RootPath, "profile", userId, folderName);

        if (!Directory.Exists(userFolder))
        {
            Directory.CreateDirectory(userFolder);
        }

        var filePath = Path.Combine(userFolder, newFileName);

        await using var outputStream = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(outputStream);

        return $"/uploads/profile/{userId}/{folderName}/{newFileName}";
    }

    private async Task<string> SaveProfileFileToS3Async(
        Stream fileStream,
        string contentType,
        string userId,
        string folderName,
        string newFileName)
    {
        var objectKey = $"profile/{folderName}/{userId}/{newFileName}";

        var putRequest = new PutObjectRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = objectKey,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3Client!.PutObjectAsync(putRequest);

        return BuildS3ObjectUrl(objectKey);
    }

    private string BuildS3ObjectUrl(string objectKey)
    {
        var bucket = _s3Settings.BucketName;
        var region = _s3Settings.Region?.Trim();

        if (string.IsNullOrWhiteSpace(region))
            return $"https://{bucket}.s3.amazonaws.com/{objectKey}";

        return $"https://{bucket}.s3.{region}.amazonaws.com/{objectKey}";
    }
}
