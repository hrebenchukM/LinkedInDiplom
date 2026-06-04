using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record ChatMemberResult
{
    public bool Succeeded { get; init; }
    public ChatMemberDto? ChatMember { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
