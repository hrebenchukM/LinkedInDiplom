using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.MessageSettings;
using Profile.Contracts.Results;

namespace Profile.Client.Contracts.Resources;

// Resource для работы с настройками сообщений Profile-модуля.
// Это внутренняя точка доступа фасада к Profile-модулю.
public interface IMessageSettingsResource
{
    Task<MessageSettingsDto> GetMyMessageSettingsAsync(GetMyMessageSettingsParameters parameters);

    Task<MessageSettingsResult> UpdateMyMessageSettingsAsync(UpdateMessageSettingsParameters parameters);

    Task<MessageSettingsResult> PatchMyMessageSettingsAsync(PatchMessageSettingsParameters parameters);
}
