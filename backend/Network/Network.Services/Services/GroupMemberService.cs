using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис участников групп
public class GroupMemberService : IGroupMemberService
{
    private const string RoleOwner = "owner";
    private const string RoleMember = "member";

    private readonly NetworkDbContext _dbContext;

    public GroupMemberService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GroupMemberResult> JoinAsync(JoinGroupParameters parameters)
    {
        var group = await _dbContext.UserGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(g =>
                g.Id == parameters.GroupId &&
                g.DeletedAt == null);

        if (group == null)
        {
            return new GroupMemberResult
            {
                Succeeded = false,
                Errors = new[] { "Group not found." }
            };
        }

        var existing = await _dbContext.GroupMembers
            .FirstOrDefaultAsync(m =>
                m.GroupId == parameters.GroupId &&
                m.UserId == parameters.UserId);

        if (existing != null)
        {
            if (existing.DeletedAt == null)
            {
                return Error("Already joined this group.");
            }

            var now = DateTime.UtcNow;
            existing.DeletedAt = null;
            existing.Role = RoleMember;
            existing.UpdatedAt = now;

            await _dbContext.SaveChangesAsync();

            return Success(existing);
        }

        var member = new GroupMember
        {
            Id = Guid.NewGuid(),
            GroupId = parameters.GroupId,
            UserId = parameters.UserId,
            Role = RoleMember,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null,
            DeletedAt = null
        };

        _dbContext.GroupMembers.Add(member);
        await _dbContext.SaveChangesAsync();

        return Success(member);
    }

    public async Task<GroupMemberResult> LeaveAsync(LeaveGroupParameters parameters)
    {
        var membership = await _dbContext.GroupMembers
            .FirstOrDefaultAsync(m =>
                m.GroupId == parameters.GroupId &&
                m.UserId == parameters.UserId &&
                m.DeletedAt == null);

        if (membership == null)
        {
            return new GroupMemberResult
            {
                Succeeded = false,
                Errors = new[] { "Group membership not found." }
            };
        }

        var group = await _dbContext.UserGroups
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == parameters.GroupId);

        if (membership.Role == RoleOwner ||
            (group != null && group.OwnerId == parameters.UserId))
        {
            return Error("Group owner cannot leave the group.");
        }

        var now = DateTime.UtcNow;
        membership.DeletedAt = now;
        membership.UpdatedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(membership);
    }

    public async Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(
        GetGroupMembersParameters parameters)
    {
        var isActiveMember = await _dbContext.GroupMembers
            .AsNoTracking()
            .AnyAsync(m =>
                m.GroupId == parameters.GroupId &&
                m.UserId == parameters.UserId &&
                m.DeletedAt == null);

        if (!isActiveMember)
            return Array.Empty<GroupMemberDto>();

        var groupExists = await _dbContext.UserGroups
            .AsNoTracking()
            .AnyAsync(g =>
                g.Id == parameters.GroupId &&
                g.DeletedAt == null);

        if (!groupExists)
            return Array.Empty<GroupMemberDto>();

        var members = await _dbContext.GroupMembers
            .AsNoTracking()
            .Where(m => m.GroupId == parameters.GroupId && m.DeletedAt == null)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return members.Select(MapToDto).ToList();
    }

    private static GroupMemberResult Success(GroupMember member)
    {
        return new GroupMemberResult
        {
            Succeeded = true,
            GroupMember = MapToDto(member)
        };
    }

    private static GroupMemberResult Error(string message)
    {
        return new GroupMemberResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static GroupMemberDto MapToDto(GroupMember member)
    {
        return new GroupMemberDto
        {
            Id = member.Id,
            GroupId = member.GroupId,
            UserId = member.UserId,
            Role = member.Role,
            CreatedAt = member.CreatedAt,
            UpdatedAt = member.UpdatedAt
        };
    }
}
