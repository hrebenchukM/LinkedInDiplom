using Profile.Client.Contracts.Resources;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.MessageSettings;
using Profile.Contracts.Results;
using Profile.Contracts.Services;

namespace Profile.Client.Resources;

// Реализация Resource для настроек сообщений.
// В модульном монолите она обращается напрямую к IMessageSettingsService.
public class MessageSettingsResource : IMessageSettingsResource
{
    private readonly IMessageSettingsService _messageSettingsService;

    public MessageSettingsResource(IMessageSettingsService messageSettingsService)
    {
        _messageSettingsService = messageSettingsService;
    }

    public Task<MessageSettingsDto> GetMyMessageSettingsAsync(GetMyMessageSettingsParameters parameters)
    {
        return _messageSettingsService.GetMyMessageSettingsAsync(parameters);
    }

    public Task<MessageSettingsResult> UpdateMyMessageSettingsAsync(UpdateMessageSettingsParameters parameters)
    {
        return _messageSettingsService.UpdateMyMessageSettingsAsync(parameters);
    }

    public Task<MessageSettingsResult> PatchMyMessageSettingsAsync(PatchMessageSettingsParameters parameters)
    {
        return _messageSettingsService.PatchMyMessageSettingsAsync(parameters);
    }
}
