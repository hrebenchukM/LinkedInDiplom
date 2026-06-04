using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с участником группы
public record GroupMemberResult
{
    public bool Succeeded { get; init; }

    public GroupMemberDto? GroupMember { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
