using Network.Contracts.DTOs;

namespace Network.Contracts.Results;

// Результат операции с администратором страницы
public record PageAdminResult
{
    public bool Succeeded { get; init; }

    public PageAdminDto? PageAdmin { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
