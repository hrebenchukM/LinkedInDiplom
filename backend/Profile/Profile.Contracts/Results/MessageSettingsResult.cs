using Profile.Contracts.DTOs;

namespace Profile.Contracts.Results;

// Результат операции с настройками сообщений
public record MessageSettingsResult
{
    public bool Succeeded { get; init; }

    public MessageSettingsDto? MessageSettings { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
