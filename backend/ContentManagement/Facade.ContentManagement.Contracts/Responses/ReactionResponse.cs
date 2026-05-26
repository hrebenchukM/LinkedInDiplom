using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с реакцией
public record ReactionResponse
{
    public bool Success { get; init; }

    public ReactionDto? Reaction { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
