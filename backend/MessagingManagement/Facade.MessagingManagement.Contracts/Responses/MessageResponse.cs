using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Responses;

public record MessageResponse
{
    public bool Success { get; init; }
    public MessageDto? Message { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
