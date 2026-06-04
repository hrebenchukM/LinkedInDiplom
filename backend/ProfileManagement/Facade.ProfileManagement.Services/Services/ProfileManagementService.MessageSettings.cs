using FacadeMessageSettingsDto = Facade.ProfileManagement.Contracts.DTOs.MessageSettingsDto;
using Facade.ProfileManagement.Contracts.Requests.MessageSettings;
using Facade.ProfileManagement.Contracts.Responses;
using Profile.Contracts.Parameters.MessageSettings;

namespace Facade.ProfileManagement.Services.Services;

public partial class ProfileManagementService
{
    public async Task<FacadeMessageSettingsDto> GetMyMessageSettingsAsync(string userId)
    {
        var settings = await _profileClient.MessageSettings.GetMyMessageSettingsAsync(
            new GetMyMessageSettingsParameters
            {
                UserId = userId
            });

        return MapMessageSettingsToFacadeDto(settings);
    }

    public async Task<MessageSettingsResponse> UpdateMyMessageSettingsAsync(
        string userId,
        UpdateMessageSettingsRequest request)
    {
        var result = await _profileClient.MessageSettings.UpdateMyMessageSettingsAsync(
            new UpdateMessageSettingsParameters
            {
                UserId = userId,
                OfficeAbsenceEnabled = request.OfficeAbsenceEnabled,
                OfficeAbsenceMessage = request.OfficeAbsenceMessage,
                NotificationsEnabled = request.NotificationsEnabled
            });

        return new MessageSettingsResponse
        {
            Success = result.Succeeded,
            MessageSettings = result.MessageSettings == null
                ? null
                : MapMessageSettingsToFacadeDto(result.MessageSettings),
            Errors = result.Errors
        };
    }

    public async Task<MessageSettingsResponse> PatchMyMessageSettingsAsync(
        string userId,
        PatchMessageSettingsRequest request)
    {
        var result = await _profileClient.MessageSettings.PatchMyMessageSettingsAsync(
            new PatchMessageSettingsParameters
            {
                UserId = userId,
                OfficeAbsenceEnabled = request.OfficeAbsenceEnabled,
                OfficeAbsenceMessage = request.OfficeAbsenceMessage,
                NotificationsEnabled = request.NotificationsEnabled
            });

        return new MessageSettingsResponse
        {
            Success = result.Succeeded,
            MessageSettings = result.MessageSettings == null
                ? null
                : MapMessageSettingsToFacadeDto(result.MessageSettings),
            Errors = result.Errors
        };
    }
}
