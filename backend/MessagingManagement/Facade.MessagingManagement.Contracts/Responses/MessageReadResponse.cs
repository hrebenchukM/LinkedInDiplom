using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Responses;

public record MessageReadResponse
{
    public bool Success { get; init; }
    public MessageReadDto? MessageRead { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
