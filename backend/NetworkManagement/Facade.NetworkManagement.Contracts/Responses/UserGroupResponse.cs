using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с группой
public record UserGroupResponse
{
    public bool Success { get; init; }

    public UserGroupDto? UserGroup { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
