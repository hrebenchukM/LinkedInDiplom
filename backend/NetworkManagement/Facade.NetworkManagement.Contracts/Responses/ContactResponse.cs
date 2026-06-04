using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с контактом
public record ContactResponse
{
    public bool Success { get; init; }

    public ContactDto? Contact { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
