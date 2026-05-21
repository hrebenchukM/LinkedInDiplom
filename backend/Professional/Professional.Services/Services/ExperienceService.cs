using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с опытом работы пользователя
public class ExperienceService : IExperienceService
{
    private readonly ProfessionalDbContext _dbContext;

    public ExperienceService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить весь опыт работы пользователя
    public async Task<IReadOnlyCollection<ExperienceDto>> GetUserExperiencesAsync(
        GetUserExperiencesParameters parameters)
    {
        var experiences = await _dbContext.Experiences
            .AsNoTracking()
            .Where(e =>
                e.UserId == parameters.UserId &&
                e.DeletedAt == null)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();

        return experiences
            .Select(MapToDto)
            .ToList();
    }

    // Получить один опыт работы по Id
    public async Task<ExperienceDto?> GetByIdAsync(GetExperienceByIdParameters parameters)
    {
        var experience = await _dbContext.Experiences
            .AsNoTracking()
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.ExperienceId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        return experience == null ? null : MapToDto(experience);
    }

    // Создать опыт работы
    public async Task<ExperienceResult> CreateAsync(CreateExperienceParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Position))
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "Position is required." }
            };
        }

        if (parameters.EndDate.HasValue && parameters.EndDate.Value < parameters.StartDate)
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "End date cannot be earlier than start date." }
            };
        }

        var experience = new Experience
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            CompanyId = parameters.CompanyId,
            Position = parameters.Position,
            EmploymentType = parameters.EmploymentType,
            WorkLocationType = parameters.WorkLocationType,
            Location = parameters.Location,
            StartDate = parameters.StartDate,
            EndDate = parameters.EndDate,
            Description = parameters.Description,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Experiences.Add(experience);
        await _dbContext.SaveChangesAsync();

        return new ExperienceResult
        {
            Succeeded = true,
            Experience = MapToDto(experience)
        };
    }

    // Полностью обновить опыт работы
    public async Task<ExperienceResult> UpdateAsync(UpdateExperienceParameters parameters)
    {
        var experience = await _dbContext.Experiences
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.ExperienceId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        if (experience == null)
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "Experience not found." }
            };
        }

        if (string.IsNullOrWhiteSpace(parameters.Position))
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "Position is required." }
            };
        }

        if (parameters.EndDate.HasValue && parameters.EndDate.Value < parameters.StartDate)
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "End date cannot be earlier than start date." }
            };
        }

        experience.CompanyId = parameters.CompanyId;
        experience.Position = parameters.Position;
        experience.EmploymentType = parameters.EmploymentType;
        experience.WorkLocationType = parameters.WorkLocationType;
        experience.Location = parameters.Location;
        experience.StartDate = parameters.StartDate;
        experience.EndDate = parameters.EndDate;
        experience.Description = parameters.Description;
        experience.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new ExperienceResult
        {
            Succeeded = true,
            Experience = MapToDto(experience)
        };
    }

    // Частично обновить опыт работы
    public async Task<ExperienceResult> PatchAsync(PatchExperienceParameters parameters)
    {
        var experience = await _dbContext.Experiences
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.ExperienceId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        if (experience == null)
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "Experience not found." }
            };
        }

        experience.CompanyId = parameters.CompanyId ?? experience.CompanyId;
        experience.Position = parameters.Position ?? experience.Position;
        experience.EmploymentType = parameters.EmploymentType ?? experience.EmploymentType;
        experience.WorkLocationType = parameters.WorkLocationType ?? experience.WorkLocationType;
        experience.Location = parameters.Location ?? experience.Location;
        experience.StartDate = parameters.StartDate ?? experience.StartDate;
        experience.EndDate = parameters.EndDate ?? experience.EndDate;
        experience.Description = parameters.Description ?? experience.Description;

        if (string.IsNullOrWhiteSpace(experience.Position))
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "Position is required." }
            };
        }

        if (experience.EndDate.HasValue && experience.EndDate.Value < experience.StartDate)
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "End date cannot be earlier than start date." }
            };
        }

        experience.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new ExperienceResult
        {
            Succeeded = true,
            Experience = MapToDto(experience)
        };
    }

    // Soft delete опыта работы
    public async Task<ExperienceResult> DeleteAsync(DeleteExperienceParameters parameters)
    {
        var experience = await _dbContext.Experiences
            .FirstOrDefaultAsync(e =>
                e.Id == parameters.ExperienceId &&
                e.UserId == parameters.UserId &&
                e.DeletedAt == null);

        if (experience == null)
        {
            return new ExperienceResult
            {
                Succeeded = false,
                Errors = new[] { "Experience not found." }
            };
        }

        experience.DeletedAt = DateTime.UtcNow;
        experience.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new ExperienceResult
        {
            Succeeded = true,
            Experience = MapToDto(experience)
        };
    }

    private static ExperienceDto MapToDto(Experience experience)
    {
        return new ExperienceDto
        {
            Id = experience.Id,
            UserId = experience.UserId,
            CompanyId = experience.CompanyId,
            Position = experience.Position,
            EmploymentType = experience.EmploymentType,
            WorkLocationType = experience.WorkLocationType,
            Location = experience.Location,
            StartDate = experience.StartDate,
            EndDate = experience.EndDate,
            Description = experience.Description,
            CreatedAt = experience.CreatedAt,
            UpdatedAt = experience.UpdatedAt
        };
    }
}