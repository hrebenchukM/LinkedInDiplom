using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с просмотром поста
public record PostViewResult
{
    public bool Succeeded { get; init; }

    public PostViewDto? PostView { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
