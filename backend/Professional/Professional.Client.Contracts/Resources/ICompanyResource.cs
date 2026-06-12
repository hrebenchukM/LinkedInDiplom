using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с компаниями.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface ICompanyResource
{
    Task<IReadOnlyCollection<CompanyDto>> GetMyCompaniesAsync(
        GetUserCompaniesParameters parameters);

    Task<CompanyDto?> GetByIdAsync(
        GetCompanyByIdParameters parameters);

    Task<CompanyResult> CreateAsync(
        CreateCompanyParameters parameters);

    Task<CompanyResult> UpdateAsync(
        UpdateCompanyParameters parameters);

    Task<CompanyResult> PatchAsync(
        PatchCompanyParameters parameters);

    Task<CompanyResult> DeleteAsync(
        DeleteCompanyParameters parameters);
}