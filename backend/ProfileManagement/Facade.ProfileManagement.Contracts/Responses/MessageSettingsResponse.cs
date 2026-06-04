using Facade.ProfileManagement.Contracts.DTOs;

namespace Facade.ProfileManagement.Contracts.Responses;

// Ответ операций с настройками сообщений
public record MessageSettingsResponse
{
    public bool Success { get; init; }

    public MessageSettingsDto? MessageSettings { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
