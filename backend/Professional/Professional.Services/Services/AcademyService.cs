using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с учебными заведениями
public class AcademyService : IAcademyService
{
    private readonly ProfessionalDbContext _dbContext;

    public AcademyService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить учебное заведение по Id
    public async Task<AcademyDto?> GetByIdAsync(GetAcademyByIdParameters parameters)
    {
        var academy = await _dbContext.Academies
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == parameters.AcademyId);

        return academy == null ? null : MapToDto(academy);
    }

    // Создать учебное заведение
    public async Task<AcademyResult> CreateAsync(CreateAcademyParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new AcademyResult
            {
                Succeeded = false,
                Errors = new[] { "Academy name is required." }
            };
        }

        var academy = new Academy
        {
            Id = Guid.NewGuid(),
            Name = parameters.Name,
            LogoUrl = parameters.LogoUrl,
            WebsiteUrl = parameters.WebsiteUrl,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Academies.Add(academy);
        await _dbContext.SaveChangesAsync();

        return new AcademyResult
        {
            Succeeded = true,
            Academy = MapToDto(academy)
        };
    }

    private static AcademyDto MapToDto(Academy academy)
    {
        return new AcademyDto
        {
            Id = academy.Id,
            Name = academy.Name,
            LogoUrl = academy.LogoUrl,
            WebsiteUrl = academy.WebsiteUrl,
            CreatedAt = academy.CreatedAt,
            UpdatedAt = academy.UpdatedAt
        };
    }
}
