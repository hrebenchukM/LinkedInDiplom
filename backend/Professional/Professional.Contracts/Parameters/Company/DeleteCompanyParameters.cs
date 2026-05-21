namespace Professional.Contracts.Parameters.Company;

// Удалить компанию
public record DeleteCompanyParameters
{
    public string UserId { get; init; } = default!;

    public Guid CompanyId { get; init; }
}