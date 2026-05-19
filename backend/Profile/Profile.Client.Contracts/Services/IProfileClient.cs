using Profile.Contracts.DTOs;

namespace Profile.Client.Contracts.Services;

// HTTP-клиент для обращения к Profile.API
public interface IProfileClient
{
    // Получить профиль по UserId через Profile.API
    Task<UserProfileDto?> GetByUserIdAsync(string userId);

    // Обновить профиль по UserId через Profile.API
    Task<UserProfileDto> UpdateByUserIdAsync(string userId, UserProfileDto profile);
    Task<UserProfileDto> UploadAvatarAsync(string userId, Stream fileStream, string fileName, string contentType);

    Task<UserProfileDto> UploadHeaderAsync(string userId, Stream fileStream, string fileName, string contentType);
}