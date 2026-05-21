namespace Professional.Contracts.Parameters.Company;

// Получить компании, созданные пользователем
public record GetUserCompaniesParameters
{
    public string UserId { get; init; } = default!;
}