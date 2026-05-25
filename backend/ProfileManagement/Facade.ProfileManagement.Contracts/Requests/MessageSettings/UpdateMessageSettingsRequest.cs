namespace Facade.ProfileManagement.Contracts.Requests.MessageSettings;

// Запрос на полное обновление настроек сообщений (PUT)
public record UpdateMessageSettingsRequest
{
    public bool OfficeAbsenceEnabled { get; init; }

    public string? OfficeAbsenceMessage { get; init; }

    public bool NotificationsEnabled { get; init; }
}
