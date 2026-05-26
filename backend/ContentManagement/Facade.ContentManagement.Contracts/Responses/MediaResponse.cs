using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с медиа
public record MediaResponse
{
    public bool Success { get; init; }

    public MediaDto? Media { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
