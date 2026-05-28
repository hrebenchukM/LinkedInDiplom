using System.ComponentModel.DataAnnotations;

namespace Facade.ProfileManagement.Contracts.Requests;

// Запрос на частичное обновление своего профиля.
// Если поле null — значит его не меняем.
public record PatchMyProfileRequest
{
    [StringLength(100)]
    public string? FirstName { get; init; }

    [StringLength(100)]
    public string? LastName { get; init; }

    [StringLength(200)]
    public string? ProfileTitle { get; init; }

    [StringLength(300)]
    public string? Headline { get; init; }

    [StringLength(2000)]
    public string? GenInfo { get; init; }

    [StringLength(200)]
    public string? University { get; init; }

    [StringLength(200)]
    public string? Location { get; init; }

    [Url]
    [StringLength(500)]
    public string? PortfolioUrl { get; init; }

    public bool? IsCompany { get; init; }
}