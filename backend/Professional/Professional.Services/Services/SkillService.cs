using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с навыками в справочнике
public class SkillService : ISkillService
{
    private readonly ProfessionalDbContext _dbContext;

    public SkillService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить навык по Id
    public async Task<SkillDto?> GetByIdAsync(GetSkillByIdParameters parameters)
    {
        var skill = await _dbContext.Skills
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == parameters.SkillId);

        return skill == null ? null : MapToDto(skill);
    }

    // Создать навык в справочнике
    public async Task<SkillResult> CreateAsync(CreateSkillParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new SkillResult
            {
                Succeeded = false,
                Errors = new[] { "Name is required." }
            };
        }

        var skill = new Skill
        {
            Id = Guid.NewGuid(),
            Name = parameters.Name,
            Description = parameters.Description,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Skills.Add(skill);
        await _dbContext.SaveChangesAsync();

        return new SkillResult
        {
            Succeeded = true,
            Skill = MapToDto(skill)
        };
    }

    private static SkillDto MapToDto(Skill skill)
    {
        return new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Description = skill.Description,
            CreatedAt = skill.CreatedAt,
            UpdatedAt = skill.UpdatedAt
        };
    }
}
