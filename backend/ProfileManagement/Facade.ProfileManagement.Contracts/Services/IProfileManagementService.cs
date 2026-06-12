using Facade.ProfileManagement.Contracts.DTOs;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Requests.MessageSettings;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;

namespace Facade.ProfileManagement.Contracts.Services;

// Интерфейс фасада управления профилем
public interface IProfileManagementService
{
    // Получить мой профиль
    Task<ProfileDto?> GetMyProfileAsync(string userId);

    // Получить профиль по UserId
    Task<ProfileDto?> GetProfileByUserIdAsync(string userId);

    // Поиск профилей
    Task<PagedResponse<ProfileSearchResultDto>> SearchProfilesAsync(
        ProfileSearchQueryRequest request,
        CancellationToken cancellationToken = default);

    // Обновить мой профиль
    Task<ProfileResponse> UpdateMyProfileAsync(string userId, UpdateMyProfileRequest request);
    // Частично обновить мой профиль
    Task<ProfileResponse> PatchMyProfileAsync(string userId, PatchMyProfileRequest request);

    // Загрузить аватар моего профиля
    Task<ProfileResponse> UploadMyAvatarAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType);

    // Загрузить header / обложку моего профиля
    Task<ProfileResponse> UploadMyHeaderAsync(
        string userId,
        Stream fileStream,
        string fileName,
        string contentType);

    Task<MessageSettingsDto> GetMyMessageSettingsAsync(string userId);

    Task<MessageSettingsResponse> UpdateMyMessageSettingsAsync(
        string userId,
        UpdateMessageSettingsRequest request);

    Task<MessageSettingsResponse> PatchMyMessageSettingsAsync(
        string userId,
        PatchMessageSettingsRequest request);

    Task<ProfileViewResponse> RecordProfileViewAsync(
        string profileOwnerId,
        string? viewerUserId,
        string viewerIp,
        string? viewerUserAgent,
        string? source);

    Task<IReadOnlyCollection<ProfileViewDto>> GetMyProfileViewsAsync(string userId);
}