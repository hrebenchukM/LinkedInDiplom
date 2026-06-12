namespace Profile.Contracts.Parameters.MessageSettings;

// Параметры для полного обновления настроек сообщений (PUT)
public record UpdateMessageSettingsParameters
{
    public string UserId { get; init; } = default!;

    public bool OfficeAbsenceEnabled { get; init; }

    public string? OfficeAbsenceMessage { get; init; }

    public bool NotificationsEnabled { get; init; }
}
