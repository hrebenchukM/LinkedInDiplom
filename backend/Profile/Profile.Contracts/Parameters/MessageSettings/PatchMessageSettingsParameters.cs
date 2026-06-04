namespace Profile.Contracts.Parameters.MessageSettings;

// Параметры для частичного обновления настроек сообщений (PATCH).
// Если поле null — значит его не меняем.
public record PatchMessageSettingsParameters
{
    public string UserId { get; init; } = default!;

    public bool? OfficeAbsenceEnabled { get; init; }

    public string? OfficeAbsenceMessage { get; init; }

    public bool? NotificationsEnabled { get; init; }
}
