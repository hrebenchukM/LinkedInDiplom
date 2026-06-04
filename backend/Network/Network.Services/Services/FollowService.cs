using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис подписок между пользователями
public class FollowService : IFollowService
{
    private readonly NetworkDbContext _dbContext;

    public FollowService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<FollowResult> FollowAsync(FollowUserParameters parameters)
    {
        if (parameters.FollowerId == parameters.FollowingId)
        {
            return Error("You cannot follow yourself.");
        }

        if (await IsBlockedEitherDirectionAsync(parameters.FollowerId, parameters.FollowingId))
        {
            return Error("Cannot follow while a block exists.");
        }

        var existing = await _dbContext.Follows
            .FirstOrDefaultAsync(f =>
                f.FollowerId == parameters.FollowerId &&
                f.FollowingId == parameters.FollowingId);

        if (existing != null)
        {
            if (existing.UnfollowedAt == null)
            {
                return Error("Already following this user.");
            }

            var now = DateTime.UtcNow;
            existing.UnfollowedAt = null;
            existing.FollowedAt = now;

            await _dbContext.SaveChangesAsync();

            return Success(existing);
        }

        var follow = new Follow
        {
            Id = Guid.NewGuid(),
            FollowerId = parameters.FollowerId,
            FollowingId = parameters.FollowingId,
            FollowedAt = DateTime.UtcNow,
            UnfollowedAt = null
        };

        _dbContext.Follows.Add(follow);
        await _dbContext.SaveChangesAsync();

        return Success(follow);
    }

    public async Task<FollowResult> UnfollowAsync(UnfollowUserParameters parameters)
    {
        var follow = await _dbContext.Follows
            .FirstOrDefaultAsync(f =>
                f.FollowerId == parameters.FollowerId &&
                f.FollowingId == parameters.FollowingId &&
                f.UnfollowedAt == null);

        if (follow == null)
        {
            return new FollowResult
            {
                Succeeded = false,
                Errors = new[] { "Follow not found." }
            };
        }

        follow.UnfollowedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Success(follow);
    }

    public async Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(GetMyFollowingParameters parameters)
    {
        var follows = await _dbContext.Follows
            .AsNoTracking()
            .Where(f => f.FollowerId == parameters.UserId && f.UnfollowedAt == null)
            .OrderByDescending(f => f.FollowedAt)
            .ToListAsync();

        return follows.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(GetMyFollowersParameters parameters)
    {
        var follows = await _dbContext.Follows
            .AsNoTracking()
            .Where(f => f.FollowingId == parameters.UserId && f.UnfollowedAt == null)
            .OrderByDescending(f => f.FollowedAt)
            .ToListAsync();

        return follows.Select(MapToDto).ToList();
    }

    private async Task<bool> IsBlockedEitherDirectionAsync(string userA, string userB)
    {
        return await _dbContext.BlockedUsers
            .AnyAsync(b =>
                b.UnblockedAt == null &&
                ((b.UserId == userA && b.BlockedUserId == userB) ||
                 (b.UserId == userB && b.BlockedUserId == userA)));
    }

    private static FollowResult Success(Follow follow)
    {
        return new FollowResult
        {
            Succeeded = true,
            Follow = MapToDto(follow)
        };
    }

    private static FollowResult Error(string message)
    {
        return new FollowResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static FollowDto MapToDto(Follow follow)
    {
        return new FollowDto
        {
            Id = follow.Id,
            FollowerId = follow.FollowerId,
            FollowingId = follow.FollowingId,
            FollowedAt = follow.FollowedAt,
            UnfollowedAt = follow.UnfollowedAt
        };
    }
}
