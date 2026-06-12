using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса компаний
public interface ICompanyService
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