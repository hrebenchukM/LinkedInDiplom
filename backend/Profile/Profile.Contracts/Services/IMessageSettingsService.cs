using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.MessageSettings;
using Profile.Contracts.Results;

namespace Profile.Contracts.Services;

// Интерфейс сервиса настроек сообщений пользователя
public interface IMessageSettingsService
{
    // Получить свои настройки; если записи нет — создать defaults и вернуть
    Task<MessageSettingsDto> GetMyMessageSettingsAsync(GetMyMessageSettingsParameters parameters);

    Task<MessageSettingsResult> UpdateMyMessageSettingsAsync(UpdateMessageSettingsParameters parameters);

    Task<MessageSettingsResult> PatchMyMessageSettingsAsync(PatchMessageSettingsParameters parameters);
}
