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

    // Получить список навыков в справочнике
    public async Task<SkillsResult> GetSkillsAsync(
        GetSkillsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Skills.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchPattern = $"%{parameters.Search.Trim()}%";
            query = query.Where(s => EF.Functions.ILike(s.Name, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "name"
            : parameters.SortBy.Trim();
        var descending = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = ApplySorting(query, sortBy, descending);

        var skills = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        return new SkillsResult
        {
            Items = skills.Select(MapToDto).ToList(),
            TotalCount = totalCount
        };
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

    private static IQueryable<Skill> ApplySorting(
        IQueryable<Skill> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "createdat" when descending => query.OrderByDescending(s => s.CreatedAt),
            "createdat" => query.OrderBy(s => s.CreatedAt),
            "updatedat" when descending => query.OrderByDescending(s => s.UpdatedAt),
            "updatedat" => query.OrderBy(s => s.UpdatedAt),
            "name" when descending => query.OrderByDescending(s => s.Name),
            "name" => query.OrderBy(s => s.Name),
            _ when descending => query.OrderByDescending(s => s.Name),
            _ => query.OrderBy(s => s.Name)
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
