using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с участником группы
public record GroupMemberResponse
{
    public bool Success { get; init; }

    public GroupMemberDto? GroupMember { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
