using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с сертификатами пользователя
public class CertificateService : ICertificateService
{
    private readonly ProfessionalDbContext _dbContext;

    public CertificateService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить все сертификаты пользователя
    public async Task<IReadOnlyCollection<CertificateDto>> GetUserCertificatesAsync(
        GetUserCertificatesParameters parameters)
    {
        var certificates = await _dbContext.Certificates
            .AsNoTracking()
            .Where(c =>
                c.UserId == parameters.UserId &&
                c.DeletedAt == null)
            .OrderByDescending(c => c.IssueDate)
            .ToListAsync();

        return certificates
            .Select(MapToDto)
            .ToList();
    }

    // Получить один сертификат по Id
    public async Task<CertificateDto?> GetByIdAsync(GetCertificateByIdParameters parameters)
    {
        var certificate = await _dbContext.Certificates
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CertificateId &&
                c.UserId == parameters.UserId &&
                c.DeletedAt == null);

        return certificate == null ? null : MapToDto(certificate);
    }

    // Создать сертификат
    public async Task<CertificateResult> CreateAsync(CreateCertificateParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Name is required." }
            };
        }

        if (parameters.ExpiryDate.HasValue && parameters.ExpiryDate.Value < parameters.IssueDate)
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Expiry date cannot be earlier than issue date." }
            };
        }

        if (parameters.AcademyId.HasValue && !await AcademyExistsAsync(parameters.AcademyId.Value))
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        var certificate = new Certificate
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            AcademyId = parameters.AcademyId,
            Name = parameters.Name,
            DownloadRef = parameters.DownloadRef,
            IssueDate = parameters.IssueDate,
            ExpiryDate = parameters.ExpiryDate,
            AccreditationId = parameters.AccreditationId,
            OrganizationUrl = parameters.OrganizationUrl,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Certificates.Add(certificate);
        await _dbContext.SaveChangesAsync();

        return new CertificateResult
        {
            Succeeded = true,
            Certificate = MapToDto(certificate)
        };
    }

    // Полностью обновить сертификат
    public async Task<CertificateResult> UpdateAsync(UpdateCertificateParameters parameters)
    {
        var certificate = await _dbContext.Certificates
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CertificateId &&
                c.UserId == parameters.UserId &&
                c.DeletedAt == null);

        if (certificate == null)
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Certificate not found." }
            };
        }

        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Name is required." }
            };
        }

        if (parameters.ExpiryDate.HasValue && parameters.ExpiryDate.Value < parameters.IssueDate)
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Expiry date cannot be earlier than issue date." }
            };
        }

        if (parameters.AcademyId.HasValue && !await AcademyExistsAsync(parameters.AcademyId.Value))
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        certificate.AcademyId = parameters.AcademyId;
        certificate.Name = parameters.Name;
        certificate.DownloadRef = parameters.DownloadRef;
        certificate.IssueDate = parameters.IssueDate;
        certificate.ExpiryDate = parameters.ExpiryDate;
        certificate.AccreditationId = parameters.AccreditationId;
        certificate.OrganizationUrl = parameters.OrganizationUrl;
        certificate.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new CertificateResult
        {
            Succeeded = true,
            Certificate = MapToDto(certificate)
        };
    }

    // Частично обновить сертификат
    public async Task<CertificateResult> PatchAsync(PatchCertificateParameters parameters)
    {
        var certificate = await _dbContext.Certificates
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CertificateId &&
                c.UserId == parameters.UserId &&
                c.DeletedAt == null);

        if (certificate == null)
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Certificate not found." }
            };
        }

        if (parameters.AcademyId.HasValue && !await AcademyExistsAsync(parameters.AcademyId.Value))
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        certificate.AcademyId = parameters.AcademyId ?? certificate.AcademyId;
        certificate.Name = parameters.Name ?? certificate.Name;
        certificate.DownloadRef = parameters.DownloadRef ?? certificate.DownloadRef;
        certificate.IssueDate = parameters.IssueDate ?? certificate.IssueDate;
        certificate.ExpiryDate = parameters.ExpiryDate ?? certificate.ExpiryDate;
        certificate.AccreditationId = parameters.AccreditationId ?? certificate.AccreditationId;
        certificate.OrganizationUrl = parameters.OrganizationUrl ?? certificate.OrganizationUrl;

        if (string.IsNullOrWhiteSpace(certificate.Name))
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Name is required." }
            };
        }

        if (certificate.ExpiryDate.HasValue && certificate.ExpiryDate.Value < certificate.IssueDate)
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Expiry date cannot be earlier than issue date." }
            };
        }

        certificate.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new CertificateResult
        {
            Succeeded = true,
            Certificate = MapToDto(certificate)
        };
    }

    // Soft delete сертификата
    public async Task<CertificateResult> DeleteAsync(DeleteCertificateParameters parameters)
    {
        var certificate = await _dbContext.Certificates
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CertificateId &&
                c.UserId == parameters.UserId &&
                c.DeletedAt == null);

        if (certificate == null)
        {
            return new CertificateResult
            {
                Succeeded = false,
                Errors = new[] { "Certificate not found." }
            };
        }

        certificate.DeletedAt = DateTime.UtcNow;
        certificate.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new CertificateResult
        {
            Succeeded = true,
            Certificate = MapToDto(certificate)
        };
    }

    private async Task<bool> AcademyExistsAsync(Guid academyId)
    {
        return await _dbContext.Academies
            .AsNoTracking()
            .AnyAsync(a => a.Id == academyId);
    }

    private static CertificateDto MapToDto(Certificate certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            UserId = certificate.UserId,
            AcademyId = certificate.AcademyId,
            Name = certificate.Name,
            DownloadRef = certificate.DownloadRef,
            IssueDate = certificate.IssueDate,
            ExpiryDate = certificate.ExpiryDate,
            AccreditationId = certificate.AccreditationId,
            OrganizationUrl = certificate.OrganizationUrl,
            CreatedAt = certificate.CreatedAt,
            UpdatedAt = certificate.UpdatedAt
        };
    }
}
