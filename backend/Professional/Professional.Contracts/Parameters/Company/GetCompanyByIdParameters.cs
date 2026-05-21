namespace Professional.Contracts.Parameters.Company;

// Получить компанию по Id
public record GetCompanyByIdParameters
{
    public Guid CompanyId { get; init; }
}