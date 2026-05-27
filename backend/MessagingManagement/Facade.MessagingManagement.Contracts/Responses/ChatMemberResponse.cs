using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Responses;

public record ChatMemberResponse
{
    public bool Success { get; init; }
    public ChatMemberDto? ChatMember { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
