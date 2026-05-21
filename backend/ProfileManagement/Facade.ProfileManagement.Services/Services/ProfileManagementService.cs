using Facade.ProfileManagement.Contracts.DTOs;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Services;

namespace Facade.ProfileManagement.Services.Services;

// Фасадный сервис для работы с профилем.
// В модульном монолите он обращается напрямую к Profile-модулю через IProfileService.
public class ProfileManagementService : IProfileManagementService
{
    private readonly IProfileService _profileService;

    public ProfileManagementService(IProfileService profileService)
    {
        _profileService = profileService;
    }

    // Получить мой профиль
    public async Task<ProfileDto?> GetMyProfileAsync(string userId)
    {
        var profile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        return profile == null ? null : MapToFacadeDto(profile);
    }

    // Получить профиль по UserId
    public async Task<ProfileDto?> GetProfileByUserIdAsync(string userId)
    {
        var profile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

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

        var updatedProfile = await _profileService.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }

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
            "avatar");

        var existingProfile = await _profileService.GetAsync(new GetProfileByUserIdParameters
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

        var updatedProfile = await _profileService.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
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
            "header");

        var existingProfile = await _profileService.GetAsync(new GetProfileByUserIdParameters
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

        var updatedProfile = await _profileService.UpdateAsync(profileToUpdate);

        return new ProfileResponse
        {
            Success = true,
            Profile = MapToFacadeDto(updatedProfile)
        };
    }

    // Сохраняем файл в uploads/profile/{userId}/avatar или header.
    // В Docker эта папка будет подключена к volume profile_uploads.
    private static async Task<string> SaveProfileFileAsync(
        string userId,
        Stream fileStream,
        string originalFileName,
        string folderName)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            throw new InvalidOperationException("Only jpg, jpeg, png and webp files are allowed.");

        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var userFolder = Path.Combine(uploadsRoot, "profile", userId, folderName);

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
}