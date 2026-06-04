using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с упоминанием
public record MentionResponse
{
    public bool Success { get; init; }

    public MentionDto? Mention { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
