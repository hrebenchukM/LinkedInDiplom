using Facade.NetworkManagement.Contracts.DTOs;

namespace Facade.NetworkManagement.Contracts.Responses;

// Ответ операций с администратором страницы
public record PageAdminResponse
{
    public bool Success { get; init; }

    public PageAdminDto? PageAdmin { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
