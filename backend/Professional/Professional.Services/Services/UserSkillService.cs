using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserSkill;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с навыками пользователя
public class UserSkillService : IUserSkillService
{
    private readonly ProfessionalDbContext _dbContext;

    public UserSkillService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить все навыки пользователя
    public async Task<IReadOnlyCollection<UserSkillDto>> GetUserSkillsAsync(
        GetUserSkillsParameters parameters)
    {
        var userSkills = await _dbContext.UserSkills
            .AsNoTracking()
            .Where(us => us.UserId == parameters.UserId)
            .OrderByDescending(us => us.OrderIndex)
            .ThenByDescending(us => us.CreatedAt)
            .ToListAsync();

        return userSkills
            .Select(MapToDto)
            .ToList();
    }

    // Получить один навык пользователя по Id
    public async Task<UserSkillDto?> GetByIdAsync(GetUserSkillByIdParameters parameters)
    {
        var userSkill = await _dbContext.UserSkills
            .AsNoTracking()
            .FirstOrDefaultAsync(us =>
                us.Id == parameters.UserSkillId &&
                us.UserId == parameters.UserId);

        return userSkill == null ? null : MapToDto(userSkill);
    }

    // Добавить навык пользователю
    public async Task<UserSkillResult> CreateAsync(CreateUserSkillParameters parameters)
    {
        if (!await SkillExistsAsync(parameters.SkillId))
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Skill not found." }
            };
        }

        if (await UserHasSkillAsync(parameters.UserId, parameters.SkillId))
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Skill already added." }
            };
        }

        if (parameters.OrderIndex < 0)
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Order index cannot be negative." }
            };
        }

        var userSkill = new UserSkill
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            SkillId = parameters.SkillId,
            Level = parameters.Level,
            IsMain = parameters.IsMain,
            OrderIndex = parameters.OrderIndex,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.UserSkills.Add(userSkill);
        await _dbContext.SaveChangesAsync();

        return new UserSkillResult
        {
            Succeeded = true,
            UserSkill = MapToDto(userSkill)
        };
    }

    // Полностью обновить навык пользователя
    public async Task<UserSkillResult> UpdateAsync(UpdateUserSkillParameters parameters)
    {
        var userSkill = await _dbContext.UserSkills
            .FirstOrDefaultAsync(us =>
                us.Id == parameters.UserSkillId &&
                us.UserId == parameters.UserId);

        if (userSkill == null)
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "User skill not found." }
            };
        }

        if (!await SkillExistsAsync(parameters.SkillId))
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Skill not found." }
            };
        }

        if (await UserHasSkillAsync(parameters.UserId, parameters.SkillId, parameters.UserSkillId))
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Skill already added." }
            };
        }

        if (parameters.OrderIndex < 0)
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Order index cannot be negative." }
            };
        }

        userSkill.SkillId = parameters.SkillId;
        userSkill.Level = parameters.Level;
        userSkill.IsMain = parameters.IsMain;
        userSkill.OrderIndex = parameters.OrderIndex;
        userSkill.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new UserSkillResult
        {
            Succeeded = true,
            UserSkill = MapToDto(userSkill)
        };
    }

    // Частично обновить навык пользователя
    public async Task<UserSkillResult> PatchAsync(PatchUserSkillParameters parameters)
    {
        var userSkill = await _dbContext.UserSkills
            .FirstOrDefaultAsync(us =>
                us.Id == parameters.UserSkillId &&
                us.UserId == parameters.UserId);

        if (userSkill == null)
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "User skill not found." }
            };
        }

        if (parameters.SkillId.HasValue)
        {
            if (!await SkillExistsAsync(parameters.SkillId.Value))
            {
                return new UserSkillResult
                {
                    Succeeded = false,
                    Errors = new[] { "Skill not found." }
                };
            }

            if (await UserHasSkillAsync(parameters.UserId, parameters.SkillId.Value, parameters.UserSkillId))
            {
                return new UserSkillResult
                {
                    Succeeded = false,
                    Errors = new[] { "Skill already added." }
                };
            }
        }

        userSkill.SkillId = parameters.SkillId ?? userSkill.SkillId;
        userSkill.Level = parameters.Level ?? userSkill.Level;
        userSkill.IsMain = parameters.IsMain ?? userSkill.IsMain;
        userSkill.OrderIndex = parameters.OrderIndex ?? userSkill.OrderIndex;

        if (userSkill.OrderIndex < 0)
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "Order index cannot be negative." }
            };
        }

        userSkill.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new UserSkillResult
        {
            Succeeded = true,
            UserSkill = MapToDto(userSkill)
        };
    }

    // Удалить навык пользователя
    public async Task<UserSkillResult> DeleteAsync(DeleteUserSkillParameters parameters)
    {
        var userSkill = await _dbContext.UserSkills
            .FirstOrDefaultAsync(us =>
                us.Id == parameters.UserSkillId &&
                us.UserId == parameters.UserId);

        if (userSkill == null)
        {
            return new UserSkillResult
            {
                Succeeded = false,
                Errors = new[] { "User skill not found." }
            };
        }

        _dbContext.UserSkills.Remove(userSkill);
        await _dbContext.SaveChangesAsync();

        return new UserSkillResult
        {
            Succeeded = true,
            UserSkill = MapToDto(userSkill)
        };
    }

    private async Task<bool> SkillExistsAsync(Guid skillId)
    {
        return await _dbContext.Skills
            .AsNoTracking()
            .AnyAsync(s => s.Id == skillId);
    }

    private async Task<bool> UserHasSkillAsync(
        string userId,
        Guid skillId,
        Guid? excludeUserSkillId = null)
    {
        return await _dbContext.UserSkills
            .AsNoTracking()
            .AnyAsync(us =>
                us.UserId == userId &&
                us.SkillId == skillId &&
                (excludeUserSkillId == null || us.Id != excludeUserSkillId));
    }

    private static UserSkillDto MapToDto(UserSkill userSkill)
    {
        return new UserSkillDto
        {
            Id = userSkill.Id,
            UserId = userSkill.UserId,
            SkillId = userSkill.SkillId,
            Level = userSkill.Level,
            IsMain = userSkill.IsMain,
            OrderIndex = userSkill.OrderIndex,
            CreatedAt = userSkill.CreatedAt,
            UpdatedAt = userSkill.UpdatedAt
        };
    }
}
