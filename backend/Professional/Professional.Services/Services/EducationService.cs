using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с образованием пользователя
public class EducationService : IEducationService
{
    private readonly ProfessionalDbContext _dbContext;

    public EducationService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить всё образование пользователя
    public async Task<IReadOnlyCollection<EducationDto>> GetUserEducationsAsync(
        GetUserEducationsParameters parameters)
    {
        var educations = await _dbContext.Educations
            .AsNoTracking()
            .Where(e =>
                e.UserId == parameters.UserId &&
                e.DeletedAt == null)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();

        return educations
            .Select(MapToDto)
            .ToList();
    }

    // Получить одну запись об образовании по Id
    public async Task<EducationDto?> GetByIdAsync(GetEducationByIdParameters parameters)
    {
        var education = await _dbContext.Educations
            .AsNoTracking()
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.EducationId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        return education == null ? null : MapToDto(education);
    }

    // Создать запись об образовании
    public async Task<EducationResult> CreateAsync(CreateEducationParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Institution))
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Institution is required." }
            };
        }

        if (parameters.EndDate.HasValue && parameters.EndDate.Value < parameters.StartDate)
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "End date cannot be earlier than start date." }
            };
        }

        if (parameters.AcademyId.HasValue && !await AcademyExistsAsync(parameters.AcademyId.Value))
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        var education = new Education
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            AcademyId = parameters.AcademyId,
            Institution = parameters.Institution,
            Degree = parameters.Degree,
            FieldOfStudy = parameters.FieldOfStudy,
            StartDate = parameters.StartDate,
            EndDate = parameters.EndDate,
            Source = parameters.Source,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Educations.Add(education);
        await _dbContext.SaveChangesAsync();

        return new EducationResult
        {
            Succeeded = true,
            Education = MapToDto(education)
        };
    }

    // Полностью обновить запись об образовании
    public async Task<EducationResult> UpdateAsync(UpdateEducationParameters parameters)
    {
        var education = await _dbContext.Educations
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.EducationId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        if (education == null)
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Education not found." }
            };
        }

        if (string.IsNullOrWhiteSpace(parameters.Institution))
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Institution is required." }
            };
        }

        if (parameters.EndDate.HasValue && parameters.EndDate.Value < parameters.StartDate)
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "End date cannot be earlier than start date." }
            };
        }

        if (parameters.AcademyId.HasValue && !await AcademyExistsAsync(parameters.AcademyId.Value))
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        education.AcademyId = parameters.AcademyId;
        education.Institution = parameters.Institution;
        education.Degree = parameters.Degree;
        education.FieldOfStudy = parameters.FieldOfStudy;
        education.StartDate = parameters.StartDate;
        education.EndDate = parameters.EndDate;
        education.Source = parameters.Source;
        education.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new EducationResult
        {
            Succeeded = true,
            Education = MapToDto(education)
        };
    }

    // Частично обновить запись об образовании
    public async Task<EducationResult> PatchAsync(PatchEducationParameters parameters)
    {
        var education = await _dbContext.Educations
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.EducationId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        if (education == null)
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Education not found." }
            };
        }

        if (parameters.AcademyId.HasValue && !await AcademyExistsAsync(parameters.AcademyId.Value))
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        education.AcademyId = parameters.AcademyId ?? education.AcademyId;
        education.Institution = parameters.Institution ?? education.Institution;
        education.Degree = parameters.Degree ?? education.Degree;
        education.FieldOfStudy = parameters.FieldOfStudy ?? education.FieldOfStudy;
        education.StartDate = parameters.StartDate ?? education.StartDate;
        education.EndDate = parameters.EndDate ?? education.EndDate;
        education.Source = parameters.Source ?? education.Source;

        if (string.IsNullOrWhiteSpace(education.Institution))
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Institution is required." }
            };
        }

        if (education.EndDate.HasValue && education.EndDate.Value < education.StartDate)
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "End date cannot be earlier than start date." }
            };
        }

        education.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new EducationResult
        {
            Succeeded = true,
            Education = MapToDto(education)
        };
    }

    // Soft delete записи об образовании
    public async Task<EducationResult> DeleteAsync(DeleteEducationParameters parameters)
    {
        var education = await _dbContext.Educations
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.EducationId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        if (education == null)
        {
            return new EducationResult
            {
                Succeeded = false,
                Errors = new[] { "Education not found." }
            };
        }

        education.DeletedAt = DateTime.UtcNow;
        education.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new EducationResult
        {
            Succeeded = true,
            Education = MapToDto(education)
        };
    }

    private async Task<bool> AcademyExistsAsync(Guid academyId)
    {
        return await _dbContext.Academies
            .AsNoTracking()
            .AnyAsync(a => a.Id == academyId);
    }

    private static EducationDto MapToDto(Education education)
    {
        return new EducationDto
        {
            Id = education.Id,
            UserId = education.UserId,
            AcademyId = education.AcademyId,
            Institution = education.Institution,
            Degree = education.Degree,
            FieldOfStudy = education.FieldOfStudy,
            StartDate = education.StartDate,
            EndDate = education.EndDate,
            Source = education.Source,
            CreatedAt = education.CreatedAt,
            UpdatedAt = education.UpdatedAt
        };
    }
}
