using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Responses;

public record ChatResponse
{
    public bool Success { get; init; }
    public ChatDto? Chat { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
