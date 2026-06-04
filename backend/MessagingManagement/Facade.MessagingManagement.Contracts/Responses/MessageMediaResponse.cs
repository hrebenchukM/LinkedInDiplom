using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Responses;

public record MessageMediaResponse
{
    public bool Success { get; init; }
    public MessageMediaDto? MessageMedia { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
