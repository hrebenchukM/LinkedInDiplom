using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций со страницей
public record PageResponse
{
    public bool Success { get; init; }

    public PageDto? Page { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
