using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Page;

// Запрос на создание страницы (владелец из JWT)
public record CreatePageRequest
{
    [Required]
    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? LogoUrl { get; init; }
}
