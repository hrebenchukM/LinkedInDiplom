using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис связей группы и постов
public class GroupPostService : IGroupPostService
{
    private readonly NetworkDbContext _dbContext;

    public GroupPostService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GroupPostResult> AttachPostToGroupAsync(AttachGroupPostParameters parameters)
    {
        if (!await IsActiveGroupMemberAsync(parameters.GroupId, parameters.UserId))
        {
            return GroupNotFound();
        }

        var existing = await _dbContext.GroupPosts
            .AnyAsync(gp =>
                gp.GroupId == parameters.GroupId &&
                gp.PostId == parameters.PostId);

        if (existing)
        {
            return Error("Group post already exists.");
        }

        var groupPost = new GroupPost
        {
            Id = Guid.NewGuid(),
            GroupId = parameters.GroupId,
            PostId = parameters.PostId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.GroupPosts.Add(groupPost);
        await _dbContext.SaveChangesAsync();

        return Success(groupPost);
    }

    public async Task<GroupPostResult> DetachPostFromGroupAsync(DetachGroupPostParameters parameters)
    {
        if (!await IsActiveGroupMemberAsync(parameters.GroupId, parameters.UserId))
        {
            return GroupNotFound();
        }

        var groupPost = await _dbContext.GroupPosts
            .FirstOrDefaultAsync(gp =>
                gp.GroupId == parameters.GroupId &&
                gp.PostId == parameters.PostId);

        if (groupPost == null)
        {
            return GroupPostNotFound();
        }

        _dbContext.GroupPosts.Remove(groupPost);
        await _dbContext.SaveChangesAsync();

        return Success(groupPost);
    }

    public async Task<IReadOnlyCollection<GroupPostDto>> GetGroupPostsAsync(GetGroupPostsParameters parameters)
    {
        if (!await IsActiveGroupMemberAsync(parameters.GroupId, parameters.UserId))
        {
            return Array.Empty<GroupPostDto>();
        }

        var groupPosts = await _dbContext.GroupPosts
            .AsNoTracking()
            .Where(gp => gp.GroupId == parameters.GroupId)
            .OrderByDescending(gp => gp.CreatedAt)
            .ToListAsync();

        return groupPosts.Select(MapToDto).ToList();
    }

    private async Task<bool> IsActiveGroupMemberAsync(Guid groupId, string userId)
    {
        var groupExists = await _dbContext.UserGroups
            .AsNoTracking()
            .AnyAsync(g =>
                g.Id == groupId &&
                g.DeletedAt == null);

        if (!groupExists)
        {
            return false;
        }

        return await _dbContext.GroupMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.GroupId == groupId &&
                m.UserId == userId &&
                m.DeletedAt == null);
    }

    private static GroupPostResult Success(GroupPost groupPost)
    {
        return new GroupPostResult
        {
            Succeeded = true,
            GroupPost = MapToDto(groupPost)
        };
    }

    private static GroupPostResult Error(string message)
    {
        return new GroupPostResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static GroupPostResult GroupNotFound()
    {
        return Error("Group not found.");
    }

    private static GroupPostResult GroupPostNotFound()
    {
        return Error("Group post not found.");
    }

    private static GroupPostDto MapToDto(GroupPost groupPost)
    {
        return new GroupPostDto
        {
            Id = groupPost.Id,
            GroupId = groupPost.GroupId,
            PostId = groupPost.PostId,
            CreatedAt = groupPost.CreatedAt
        };
    }
}
