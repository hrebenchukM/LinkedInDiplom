using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с компаниями
public class CompanyService : ICompanyService
{
    private readonly ProfessionalDbContext _dbContext;

    public CompanyService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить компании, созданные текущим пользователем
    public async Task<IReadOnlyCollection<CompanyDto>> GetMyCompaniesAsync(
        GetUserCompaniesParameters parameters)
    {
        var companies = await _dbContext.Companies
            .AsNoTracking()
            .Where(c =>
                c.OwnerUserId == parameters.UserId &&
                c.DeletedAt == null)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return companies
            .Select(MapToDto)
            .ToList();
    }

    // Получить компанию по Id
    public async Task<CompanyDto?> GetByIdAsync(GetCompanyByIdParameters parameters)
    {
        var company = await _dbContext.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CompanyId &&
                c.DeletedAt == null);

        return company == null ? null : MapToDto(company);
    }

    // Создать компанию
    public async Task<CompanyResult> CreateAsync(CreateCompanyParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new CompanyResult
            {
                Succeeded = false,
                Errors = new[] { "Company name is required." }
            };
        }

        var company = new Company
        {
            Id = Guid.NewGuid(),
            OwnerUserId = parameters.OwnerUserId,
            Name = parameters.Name,
            LogoUrl = parameters.LogoUrl,
            Industry = parameters.Industry,
            Location = parameters.Location,
            WebsiteUrl = parameters.WebsiteUrl,
            Description = parameters.Description,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Companies.Add(company);
        await _dbContext.SaveChangesAsync();

        return new CompanyResult
        {
            Succeeded = true,
            Company = MapToDto(company)
        };
    }

    // Полностью обновить компанию
    public async Task<CompanyResult> UpdateAsync(UpdateCompanyParameters parameters)
    {
        var company = await _dbContext.Companies
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CompanyId &&
                c.OwnerUserId == parameters.UserId &&
                c.DeletedAt == null);

        if (company == null)
        {
            return new CompanyResult
            {
                Succeeded = false,
                Errors = new[] { "Company not found." }
            };
        }

        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new CompanyResult
            {
                Succeeded = false,
                Errors = new[] { "Company name is required." }
            };
        }

        company.Name = parameters.Name;
        company.LogoUrl = parameters.LogoUrl;
        company.Industry = parameters.Industry;
        company.Location = parameters.Location;
        company.WebsiteUrl = parameters.WebsiteUrl;
        company.Description = parameters.Description;
        company.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new CompanyResult
        {
            Succeeded = true,
            Company = MapToDto(company)
        };
    }

    // Частично обновить компанию
    public async Task<CompanyResult> PatchAsync(PatchCompanyParameters parameters)
    {
        var company = await _dbContext.Companies
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CompanyId &&
                c.OwnerUserId == parameters.UserId &&
                c.DeletedAt == null);

        if (company == null)
        {
            return new CompanyResult
            {
                Succeeded = false,
                Errors = new[] { "Company not found." }
            };
        }

        company.Name = parameters.Name ?? company.Name;
        company.LogoUrl = parameters.LogoUrl ?? company.LogoUrl;
        company.Industry = parameters.Industry ?? company.Industry;
        company.Location = parameters.Location ?? company.Location;
        company.WebsiteUrl = parameters.WebsiteUrl ?? company.WebsiteUrl;
        company.Description = parameters.Description ?? company.Description;

        if (string.IsNullOrWhiteSpace(company.Name))
        {
            return new CompanyResult
            {
                Succeeded = false,
                Errors = new[] { "Company name is required." }
            };
        }

        company.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new CompanyResult
        {
            Succeeded = true,
            Company = MapToDto(company)
        };
    }

    // Soft delete компании
    public async Task<CompanyResult> DeleteAsync(DeleteCompanyParameters parameters)
    {
        var company = await _dbContext.Companies
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CompanyId &&
                c.OwnerUserId == parameters.UserId &&
                c.DeletedAt == null);

        if (company == null)
        {
            return new CompanyResult
            {
                Succeeded = false,
                Errors = new[] { "Company not found." }
            };
        }

        company.DeletedAt = DateTime.UtcNow;
        company.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new CompanyResult
        {
            Succeeded = true,
            Company = MapToDto(company)
        };
    }

    private static CompanyDto MapToDto(Company company)
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