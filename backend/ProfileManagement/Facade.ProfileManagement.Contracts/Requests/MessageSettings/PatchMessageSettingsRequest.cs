namespace Facade.ProfileManagement.Contracts.Requests.MessageSettings;

// Запрос на частичное обновление настроек сообщений (PATCH).
// Если поле null — значит его не меняем.
public record PatchMessageSettingsRequest
{
    public bool? OfficeAbsenceEnabled { get; init; }

    public string? OfficeAbsenceMessage { get; init; }

    public bool? NotificationsEnabled { get; init; }
}
