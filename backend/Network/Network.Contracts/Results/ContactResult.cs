using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с контактом
public record ContactResult
{
    public bool Succeeded { get; init; }

    public ContactDto? Contact { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
