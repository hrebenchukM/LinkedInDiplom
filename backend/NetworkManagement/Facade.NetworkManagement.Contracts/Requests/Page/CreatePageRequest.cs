using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Page;

// Запрос на создание страницы (владелец из JWT)
public record CreatePageRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; init; } = default!;

    [StringLength(2000)]
    public string? Description { get; init; }

    [Url]
    [StringLength(500)]
    public string? LogoUrl { get; init; }
}
