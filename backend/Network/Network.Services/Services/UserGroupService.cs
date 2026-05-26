using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис групп пользователей
public class UserGroupService : IUserGroupService
{
    private const string RoleOwner = "owner";

    private readonly NetworkDbContext _dbContext;

    public UserGroupService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserGroupResult> CreateAsync(CreateUserGroupParameters parameters)
    {
        var name = parameters.Name.Trim();

        if (string.IsNullOrEmpty(name))
        {
            return Error("Group name is required.");
        }

        var now = DateTime.UtcNow;

        var group = new UserGroup
        {
            Id = Guid.NewGuid(),
            OwnerId = parameters.OwnerId,
            Name = name,
            Description = parameters.Description,
            AvatarUrl = parameters.AvatarUrl,
            CreatedAt = now,
            UpdatedAt = null,
            DeletedAt = null
        };

        var ownerMember = new GroupMember
        {
            Id = Guid.NewGuid(),
            GroupId = group.Id,
            UserId = parameters.OwnerId,
            Role = RoleOwner,
            CreatedAt = now,
            UpdatedAt = null,
            DeletedAt = null
        };

        _dbContext.UserGroups.Add(group);
        _dbContext.GroupMembers.Add(ownerMember);
        await _dbContext.SaveChangesAsync();

        return Success(group);
    }

    public async Task<IReadOnlyCollection<UserGroupDto>> GetMyGroupsAsync(
        GetMyUserGroupsParameters parameters)
    {
        var groups = await (
                from member in _dbContext.GroupMembers.AsNoTracking()
                join userGroup in _dbContext.UserGroups.AsNoTracking() on member.GroupId equals userGroup.Id
                where member.UserId == parameters.UserId &&
                      member.DeletedAt == null &&
                      userGroup.DeletedAt == null
                orderby userGroup.CreatedAt descending
                select userGroup)
            .ToListAsync();

        return groups.Select(MapToDto).ToList();
    }

    public async Task<UserGroupDto?> GetByIdAsync(GetUserGroupByIdParameters parameters)
    {
        var isActiveMember = await _dbContext.GroupMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.GroupId == parameters.GroupId &&
                m.UserId == parameters.UserId &&
                m.DeletedAt == null);

        if (!isActiveMember)
            return null;

        var group = await _dbContext.UserGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(g =>
                g.Id == parameters.GroupId &&
                g.DeletedAt == null);

        return group == null ? null : MapToDto(group);
    }

    public async Task<UserGroupResult> UpdateAsync(UpdateUserGroupParameters parameters)
    {
        var group = await _dbContext.UserGroups
            .FirstOrDefaultAsync(g =>
                g.Id == parameters.GroupId &&
                g.OwnerId == parameters.OwnerId &&
                g.DeletedAt == null);

        if (group == null)
            return NotFound();

        var name = parameters.Name.Trim();

        if (string.IsNullOrEmpty(name))
        {
            return Error("Group name is required.");
        }

        var now = DateTime.UtcNow;
        group.Name = name;
        group.Description = parameters.Description;
        group.AvatarUrl = parameters.AvatarUrl;
        group.UpdatedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(group);
    }

    public async Task<UserGroupResult> DeleteAsync(DeleteUserGroupParameters parameters)
    {
        var group = await _dbContext.UserGroups
            .FirstOrDefaultAsync(g =>
                g.Id == parameters.GroupId &&
                g.OwnerId == parameters.OwnerId &&
                g.DeletedAt == null);

        if (group == null)
            return NotFound();

        var now = DateTime.UtcNow;
        group.DeletedAt = now;
        group.UpdatedAt = now;

        var activeMembers = await _dbContext.GroupMembers
            .Where(m => m.GroupId == parameters.GroupId && m.DeletedAt == null)
            .ToListAsync();

        foreach (var member in activeMembers)
        {
            member.DeletedAt = now;
            member.UpdatedAt = now;
        }

        await _dbContext.SaveChangesAsync();

        return Success(group);
    }

    private static UserGroupResult Success(UserGroup group)
    {
        return new UserGroupResult
        {
            Succeeded = true,
            UserGroup = MapToDto(group)
        };
    }

    private static UserGroupResult Error(string message)
    {
        return new UserGroupResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static UserGroupResult NotFound()
    {
        return new UserGroupResult
        {
            Succeeded = false,
            Errors = new[] { "Group not found." }
        };
    }

    private static UserGroupDto MapToDto(UserGroup group)
    {
        return new UserGroupDto
        {
            Id = group.Id,
            OwnerId = group.OwnerId,
            Name = group.Name,
            Description = group.Description,
            AvatarUrl = group.AvatarUrl,
            CreatedAt = group.CreatedAt,
            UpdatedAt = group.UpdatedAt
        };
    }
}
