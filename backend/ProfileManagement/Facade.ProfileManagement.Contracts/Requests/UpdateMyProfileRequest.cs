namespace Facade.ProfileManagement.Contracts.Requests;

// Запрос на обновление своего профиля
public record UpdateMyProfileRequest
{
    public string? FirstName { get; init; }

    public string? LastName { get; init; }

    public string? AvatarUrl { get; init; }

    public string? HeaderUrl { get; init; }

    public string? ProfileTitle { get; init; }

    public string? Headline { get; init; }

    public string? GenInfo { get; init; }

    public string? University { get; init; }

    public string? Location { get; init; }

    public string? PortfolioUrl { get; init; }

    public bool IsCompany { get; init; }
}