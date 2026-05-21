namespace Facade.ProfileManagement.Contracts.Requests;

// Запрос на частичное обновление своего профиля.
// Если поле null — значит его не меняем.
public record PatchMyProfileRequest
{
    public string? FirstName { get; init; }

    public string? LastName { get; init; }

    public string? ProfileTitle { get; init; }

    public string? Headline { get; init; }

    public string? GenInfo { get; init; }

    public string? University { get; init; }

    public string? Location { get; init; }

    public string? PortfolioUrl { get; init; }

    public bool? IsCompany { get; init; }
}