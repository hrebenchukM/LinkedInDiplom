using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.RecommendedSkillByPosition;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис рекомендованных навыков по должности (глобальный справочник)
public class RecommendedSkillByPositionService : IRecommendedSkillByPositionService
{
    private readonly ProfessionalDbContext _dbContext;

    public RecommendedSkillByPositionService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить рекомендованные навыки для должности
    public async Task<IReadOnlyCollection<RecommendedSkillByPositionDto>> GetRecommendedSkillsByPositionAsync(
        GetRecommendedSkillsByPositionParameters parameters)
    {
        var position = NormalizePosition(parameters.Position);
        if (position == null)
            return Array.Empty<RecommendedSkillByPositionDto>();

        var items = await _dbContext.RecommendedSkillsByPosition
            .AsNoTracking()
            .Where(r => r.Position == position)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return items
            .Select(MapToDto)
            .ToList();
    }

    // Получить одну рекомендацию по Id
    public async Task<RecommendedSkillByPositionDto?> GetByIdAsync(
        GetRecommendedSkillByPositionByIdParameters parameters)
    {
        var item = await _dbContext.RecommendedSkillsByPosition
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == parameters.RspId);

        return item == null ? null : MapToDto(item);
    }

    // Добавить рекомендованный навык к должности
    public async Task<RecommendedSkillByPositionResult> CreateAsync(
        CreateRecommendedSkillByPositionParameters parameters)
    {
        var position = NormalizePosition(parameters.Position);
        if (position == null)
        {
            return new RecommendedSkillByPositionResult
            {
                Succeeded = false,
                Errors = new[] { "Position is required." }
            };
        }

        if (!await SkillExistsAsync(parameters.SkillId))
        {
            return new RecommendedSkillByPositionResult
            {
                Succeeded = false,
                Errors = new[] { "Skill not found." }
            };
        }

        if (await PositionHasSkillAsync(position, parameters.SkillId))
        {
            return new RecommendedSkillByPositionResult
            {
                Succeeded = false,
                Errors = new[] { "Skill already added for this position." }
            };
        }

        var recommendedSkill = new RecommendedSkillByPosition
        {
            Id = Guid.NewGuid(),
            Position = position,
            SkillId = parameters.SkillId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.RecommendedSkillsByPosition.Add(recommendedSkill);
        await _dbContext.SaveChangesAsync();

        return new RecommendedSkillByPositionResult
        {
            Succeeded = true,
            RecommendedSkillByPosition = MapToDto(recommendedSkill)
        };
    }

    // Удалить рекомендацию (hard delete)
    public async Task<RecommendedSkillByPositionResult> DeleteAsync(
        DeleteRecommendedSkillByPositionParameters parameters)
    {
        var recommendedSkill = await _dbContext.RecommendedSkillsByPosition
            .FirstOrDefaultAsync(r => r.Id == parameters.RspId);

        if (recommendedSkill == null)
        {
            return new RecommendedSkillByPositionResult
            {
                Succeeded = false,
                Errors = new[] { "Recommended skill not found." }
            };
        }

        _dbContext.RecommendedSkillsByPosition.Remove(recommendedSkill);
        await _dbContext.SaveChangesAsync();

        return new RecommendedSkillByPositionResult
        {
            Succeeded = true,
            RecommendedSkillByPosition = MapToDto(recommendedSkill)
        };
    }

    private static string? NormalizePosition(string? position)
    {
        if (position == null)
            return null;

        var trimmed = position.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private async Task<bool> SkillExistsAsync(Guid skillId)
    {
        return await _dbContext.Skills
            .AsNoTracking()
            .AnyAsync(s => s.Id == skillId);
    }

    private async Task<bool> PositionHasSkillAsync(string position, Guid skillId)
    {
        return await _dbContext.RecommendedSkillsByPosition
            .AsNoTracking()
            .AnyAsync(r => r.Position == position && r.SkillId == skillId);
    }

    private static RecommendedSkillByPositionDto MapToDto(RecommendedSkillByPosition entity)
    {
        return new RecommendedSkillByPositionDto
        {
            Id = entity.Id,
            Position = entity.Position,
            SkillId = entity.SkillId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
