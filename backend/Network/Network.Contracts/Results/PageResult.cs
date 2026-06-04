using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции со страницей
public record PageResult
{
    public bool Succeeded { get; init; }

    public PageDto? Page { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
