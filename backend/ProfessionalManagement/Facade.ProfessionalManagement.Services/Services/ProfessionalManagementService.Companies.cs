using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Responses;
using Professional.Contracts.Parameters.Company;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    // Получить мои компании
    public async Task<IReadOnlyCollection<CompanyDto>> GetMyCompaniesAsync(string userId)
    {
        var companies = await _professionalClient.Companies.GetMyCompaniesAsync(
            new GetUserCompaniesParameters
            {
                UserId = userId
            });

        return companies
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить компанию по Id
    public async Task<CompanyDto?> GetCompanyByIdAsync(Guid companyId)
    {
        var company = await _professionalClient.Companies.GetByIdAsync(
            new GetCompanyByIdParameters
            {
                CompanyId = companyId
            });

        return company == null ? null : MapToFacadeDto(company);
    }

    // Создать мою компанию
    public async Task<CompanyResponse> CreateMyCompanyAsync(
        string userId,
        CreateCompanyRequest request)
    {
        var result = await _professionalClient.Companies.CreateAsync(
            new CreateCompanyParameters
            {
                OwnerUserId = userId,
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                Industry = request.Industry,
                Location = request.Location,
                WebsiteUrl = request.WebsiteUrl,
                Description = request.Description
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    // Полностью обновить мою компанию
    public async Task<CompanyResponse> UpdateMyCompanyAsync(
        string userId,
        Guid companyId,
        UpdateCompanyRequest request)
    {
        var result = await _professionalClient.Companies.UpdateAsync(
            new UpdateCompanyParameters
            {
                UserId = userId,
                CompanyId = companyId,
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                Industry = request.Industry,
                Location = request.Location,
                WebsiteUrl = request.WebsiteUrl,
                Description = request.Description
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    // Частично обновить мою компанию
    public async Task<CompanyResponse> PatchMyCompanyAsync(
        string userId,
        Guid companyId,
        PatchCompanyRequest request)
    {
        var result = await _professionalClient.Companies.PatchAsync(
            new PatchCompanyParameters
            {
                UserId = userId,
                CompanyId = companyId,
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                Industry = request.Industry,
                Location = request.Location,
                WebsiteUrl = request.WebsiteUrl,
                Description = request.Description
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    // Удалить мою компанию
    public async Task<CompanyResponse> DeleteMyCompanyAsync(
        string userId,
        Guid companyId)
    {
        var result = await _professionalClient.Companies.DeleteAsync(
            new DeleteCompanyParameters
            {
                UserId = userId,
                CompanyId = companyId
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    private static CompanyDto MapToFacadeDto(Professional.Contracts.DTOs.CompanyDto company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            OwnerUserId = company.OwnerUserId,
            Name = company.Name,
            LogoUrl = company.LogoUrl,
            Industry = company.Industry,
            Location = company.Location,
            WebsiteUrl = company.WebsiteUrl,
            Description = company.Description,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };
    }
}
