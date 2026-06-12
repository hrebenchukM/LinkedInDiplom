using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с подписчиком страницы
public record PageFollowerResponse
{
    public bool Success { get; init; }

    public PageFollowerDto? PageFollower { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
