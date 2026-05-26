using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Page;

// Запрос на обновление страницы (владелец из JWT)
public record UpdatePageRequest
{
    [Required]
    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? LogoUrl { get; init; }
}
