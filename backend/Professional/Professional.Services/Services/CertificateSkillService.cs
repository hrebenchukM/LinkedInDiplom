using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.CertificateSkill;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для связок сертификата с навыками из справочника
public class CertificateSkillService : ICertificateSkillService
{
    private readonly ProfessionalDbContext _dbContext;

    public CertificateSkillService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить все навыки сертификата
    public async Task<IReadOnlyCollection<CertificateSkillDto>> GetCertificateSkillsAsync(
        GetCertificateSkillsParameters parameters)
    {
        if (!await UserOwnsCertificateAsync(parameters.UserId, parameters.CertificateId))
            return Array.Empty<CertificateSkillDto>();

        var certificateSkills = await _dbContext.CertificateSkills
            .AsNoTracking()
            .Where(cs => cs.CertificateId == parameters.CertificateId)
            .OrderByDescending(cs => cs.CreatedAt)
            .ToListAsync();

        return certificateSkills
            .Select(MapToDto)
            .ToList();
    }

    // Получить одну связку по Id
    public async Task<CertificateSkillDto?> GetByIdAsync(
        GetCertificateSkillByIdParameters parameters)
    {
        if (!await UserOwnsCertificateAsync(parameters.UserId, parameters.CertificateId))
            return null;

        var certificateSkill = await _dbContext.CertificateSkills
            .AsNoTracking()
            .FirstOrDefaultAsync(cs =>
                cs.Id == parameters.CertificateSkillId &&
                cs.CertificateId == parameters.CertificateId);

        return certificateSkill == null ? null : MapToDto(certificateSkill);
    }

    // Добавить навык к сертификату
    public async Task<CertificateSkillResult> CreateAsync(
        CreateCertificateSkillParameters parameters)
    {
        if (!await UserOwnsCertificateAsync(parameters.UserId, parameters.CertificateId))
        {
            return new CertificateSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Certificate not found." }
            };
        }

        if (!await SkillExistsAsync(parameters.SkillId))
        {
            return new CertificateSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Skill not found." }
            };
        }

        if (await CertificateHasSkillAsync(parameters.CertificateId, parameters.SkillId))
        {
            return new CertificateSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Skill already added to certificate." }
            };
        }

        var certificateSkill = new CertificateSkill
        {
            Id = Guid.NewGuid(),
            CertificateId = parameters.CertificateId,
            SkillId = parameters.SkillId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.CertificateSkills.Add(certificateSkill);
        await _dbContext.SaveChangesAsync();

        return new CertificateSkillResult
        {
            Succeeded = true,
            CertificateSkill = MapToDto(certificateSkill)
        };
    }

    // Удалить связку (hard delete)
    public async Task<CertificateSkillResult> DeleteAsync(
        DeleteCertificateSkillParameters parameters)
    {
        if (!await UserOwnsCertificateAsync(parameters.UserId, parameters.CertificateId))
        {
            return new CertificateSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Certificate skill not found." }
            };
        }

        var certificateSkill = await _dbContext.CertificateSkills
            .FirstOrDefaultAsync(cs =>
                cs.Id == parameters.CertificateSkillId &&
                cs.CertificateId == parameters.CertificateId);

        if (certificateSkill == null)
        {
            return new CertificateSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Certificate skill not found." }
            };
        }

        _dbContext.CertificateSkills.Remove(certificateSkill);
        await _dbContext.SaveChangesAsync();

        return new CertificateSkillResult
        {
            Succeeded = true,
            CertificateSkill = MapToDto(certificateSkill)
        };
    }

    private async Task<bool> UserOwnsCertificateAsync(string userId, Guid certificateId)
    {
        return await _dbContext.Certificates
            .AsNoTracking()
            .AnyAsync(c =>
                c.Id == certificateId &&
                c.UserId == userId &&
                c.DeletedAt == null);
    }

    private async Task<bool> SkillExistsAsync(Guid skillId)
    {
        return await _dbContext.Skills
            .AsNoTracking()
            .AnyAsync(s => s.Id == skillId);
    }

    private async Task<bool> CertificateHasSkillAsync(Guid certificateId, Guid skillId)
    {
        return await _dbContext.CertificateSkills
            .AsNoTracking()
            .AnyAsync(cs =>
                cs.CertificateId == certificateId &&
                cs.SkillId == skillId);
    }

    private static CertificateSkillDto MapToDto(CertificateSkill certificateSkill)
    {
        return new CertificateSkillDto
        {
            Id = certificateSkill.Id,
            CertificateId = certificateSkill.CertificateId,
            SkillId = certificateSkill.SkillId,
            CreatedAt = certificateSkill.CreatedAt
        };
    }
}
