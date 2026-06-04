using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.BlockedUser;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис блокировок пользователей
public class BlockedUserService : IBlockedUserService
{
    private readonly NetworkDbContext _dbContext;

    public BlockedUserService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BlockedUserResult> BlockAsync(BlockUserParameters parameters)
    {
        if (parameters.UserId == parameters.BlockedUserId)
        {
            return Error("You cannot block yourself.");
        }

        var existing = await _dbContext.BlockedUsers
            .FirstOrDefaultAsync(b =>
                b.UserId == parameters.UserId &&
                b.BlockedUserId == parameters.BlockedUserId);

        if (existing != null)
        {
            if (existing.UnblockedAt == null)
            {
                return Error("User is already blocked.");
            }

            var now = DateTime.UtcNow;
            existing.UnblockedAt = null;
            existing.BlockedAt = now;

            await _dbContext.SaveChangesAsync();

            return Success(existing);
        }

        var blockedUser = new BlockedUser
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            BlockedUserId = parameters.BlockedUserId,
            BlockedAt = DateTime.UtcNow,
            UnblockedAt = null
        };

        _dbContext.BlockedUsers.Add(blockedUser);
        await _dbContext.SaveChangesAsync();

        return Success(blockedUser);
    }

    public async Task<BlockedUserResult> UnblockAsync(UnblockUserParameters parameters)
    {
        var blockedUser = await _dbContext.BlockedUsers
            .FirstOrDefaultAsync(b =>
                b.UserId == parameters.UserId &&
                b.BlockedUserId == parameters.BlockedUserId &&
                b.UnblockedAt == null);

        if (blockedUser == null)
        {
            return new BlockedUserResult
            {
                Succeeded = false,
                Errors = new[] { "Block not found." }
            };
        }

        blockedUser.UnblockedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Success(blockedUser);
    }

    public async Task<IReadOnlyCollection<BlockedUserDto>> GetMyBlockedAsync(
        GetMyBlockedUsersParameters parameters)
    {
        var blocks = await _dbContext.BlockedUsers
            .AsNoTracking()
            .Where(b => b.UserId == parameters.UserId && b.UnblockedAt == null)
            .OrderByDescending(b => b.BlockedAt)
            .ToListAsync();

        return blocks.Select(MapToDto).ToList();
    }

    private static BlockedUserResult Success(BlockedUser blockedUser)
    {
        return new BlockedUserResult
        {
            Succeeded = true,
            BlockedUser = MapToDto(blockedUser)
        };
    }

    private static BlockedUserResult Error(string message)
    {
        return new BlockedUserResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static BlockedUserDto MapToDto(BlockedUser blockedUser)
    {
        return new BlockedUserDto
        {
            Id = blockedUser.Id,
            UserId = blockedUser.UserId,
            BlockedUserId = blockedUser.BlockedUserId,
            BlockedAt = blockedUser.BlockedAt,
            UnblockedAt = blockedUser.UnblockedAt
        };
    }
}
