namespace Profile.Contracts.Parameters.MessageSettings;

// Параметры для получения своих настроек сообщений (UserId из JWT)
public record GetMyMessageSettingsParameters
{
    public string UserId { get; init; } = default!;
}
