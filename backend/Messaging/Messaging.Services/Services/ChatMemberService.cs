using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.ChatMember;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Messaging.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Messaging.Services.Services;

public class ChatMemberService : IChatMemberService
{
    private readonly MessagingDbContext _dbContext;

    public ChatMemberService(MessagingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ChatMemberResult> JoinAsync(JoinChatParameters parameters)
    {
        var chatExists = await _dbContext.Chats
            .AsNoTracking()
            .AnyAsync(c => c.Id == parameters.ChatId && c.DeletedAt == null);

        if (!chatExists)
        {
            return Error("Chat not found.");
        }

        var existing = await _dbContext.ChatMembers
            .FirstOrDefaultAsync(cm =>
                cm.ChatId == parameters.ChatId &&
                cm.UserId == parameters.UserId);

        var now = DateTime.UtcNow;

        if (existing is { LeftAt: null })
        {
            return Error("Already joined this chat.");
        }

        if (existing != null)
        {
            existing.LeftAt = null;
            existing.JoinedAt = now;
            existing.Folder = parameters.Folder;

            await _dbContext.SaveChangesAsync();

            return new ChatMemberResult
            {
                Succeeded = true,
                ChatMember = Map(existing)
            };
        }

        var member = new ChatMember
        {
            Id = Guid.NewGuid(),
            ChatId = parameters.ChatId,
            UserId = parameters.UserId,
            Folder = parameters.Folder,
            JoinedAt = now,
            LeftAt = null
        };

        _dbContext.ChatMembers.Add(member);
        await _dbContext.SaveChangesAsync();

        return new ChatMemberResult
        {
            Succeeded = true,
            ChatMember = Map(member)
        };
    }

    public async Task<ChatMemberResult> LeaveAsync(LeaveChatParameters parameters)
    {
        var member = await _dbContext.ChatMembers
            .FirstOrDefaultAsync(cm =>
                cm.ChatId == parameters.ChatId &&
                cm.UserId == parameters.UserId &&
                cm.LeftAt == null);

        if (member == null)
        {
            return Error("Chat membership not found.");
        }

        var isCreator = await _dbContext.Chats
            .AsNoTracking()
            .AnyAsync(c =>
                c.Id == parameters.ChatId &&
                c.DeletedAt == null &&
                c.CreatedBy == parameters.UserId);

        if (isCreator)
        {
            return Error("Chat creator cannot leave the chat.");
        }

        member.LeftAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return new ChatMemberResult
        {
            Succeeded = true,
            ChatMember = Map(member)
        };
    }

    public async Task<IReadOnlyCollection<ChatMemberDto>> GetChatMembersAsync(GetChatMembersParameters parameters)
    {
        var hasAccess = await _dbContext.ChatMembers
            .AsNoTracking()
            .AnyAsync(cm =>
                cm.ChatId == parameters.ChatId &&
                cm.UserId == parameters.UserId &&
                cm.LeftAt == null &&
                _dbContext.Chats.Any(c => c.Id == cm.ChatId && c.DeletedAt == null));

        if (!hasAccess)
        {
            return Array.Empty<ChatMemberDto>();
        }

        var members = await _dbContext.ChatMembers
            .AsNoTracking()
            .Where(cm => cm.ChatId == parameters.ChatId && cm.LeftAt == null)
            .OrderByDescending(cm => cm.JoinedAt)
            .Select(cm => Map(cm))
            .ToListAsync();

        return members;
    }

    private static ChatMemberDto Map(ChatMember member)
    {
        return new ChatMemberDto
        {
            Id = member.Id,
            ChatId = member.ChatId,
            UserId = member.UserId,
            Folder = member.Folder,
            JoinedAt = member.JoinedAt,
            LeftAt = member.LeftAt
        };
    }

    private static ChatMemberResult Error(string message)
    {
        return new ChatMemberResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }
}
