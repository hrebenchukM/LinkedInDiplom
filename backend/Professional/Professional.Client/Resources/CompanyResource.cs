using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для компаний.
// В модульном монолите она обращается напрямую к ICompanyService.
public class CompanyResource : ICompanyResource
{
    private readonly ICompanyService _companyService;

    public CompanyResource(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    public Task<IReadOnlyCollection<CompanyDto>> GetMyCompaniesAsync(
        GetUserCompaniesParameters parameters)
    {
        return _companyService.GetMyCompaniesAsync(parameters);
    }

    public Task<CompanyDto?> GetByIdAsync(GetCompanyByIdParameters parameters)
    {
        return _companyService.GetByIdAsync(parameters);
    }

    public Task<CompanyResult> CreateAsync(CreateCompanyParameters parameters)
    {
        return _companyService.CreateAsync(parameters);
    }

    public Task<CompanyResult> UpdateAsync(UpdateCompanyParameters parameters)
    {
        return _companyService.UpdateAsync(parameters);
    }

    public Task<CompanyResult> PatchAsync(PatchCompanyParameters parameters)
    {
        return _companyService.PatchAsync(parameters);
    }

    public Task<CompanyResult> DeleteAsync(DeleteCompanyParameters parameters)
    {
        return _companyService.DeleteAsync(parameters);
    }
}