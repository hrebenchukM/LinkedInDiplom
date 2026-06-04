using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций со связью группы и поста
public record GroupPostResponse
{
    public bool Success { get; init; }

    public GroupPostDto? GroupPost { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
