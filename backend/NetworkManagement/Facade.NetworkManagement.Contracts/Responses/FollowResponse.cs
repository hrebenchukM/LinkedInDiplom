using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с подпиской
public record FollowResponse
{
    public bool Success { get; init; }

    public FollowDto? Follow { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
