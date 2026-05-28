using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Messaging.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Messaging.Services.Services;

/// <summary>
/// Core service модуля Messaging для чатов.
/// Отвечает за создание чата, membership и soft delete чата/участников.
/// </summary>
public class ChatService : IChatService
{
    private readonly MessagingDbContext _dbContext;

    public ChatService(MessagingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ChatResult> CreateAsync(CreateChatParameters parameters)
    {
        var now = DateTime.UtcNow;
        var chatId = Guid.NewGuid();

        var chat = new Chat
        {
            Id = chatId,
            CreatedBy = parameters.UserId,
            CreatedAt = now,
            DeletedAt = null
        };

        var member = new ChatMember
        {
            Id = Guid.NewGuid(),
            ChatId = chatId,
            UserId = parameters.UserId,
            Folder = null,
            JoinedAt = now,
            LeftAt = null
        };

        _dbContext.Chats.Add(chat);
        _dbContext.ChatMembers.Add(member);
        await _dbContext.SaveChangesAsync();

        return new ChatResult
        {
            Succeeded = true,
            Chat = MapChat(chat, new[] { member })
        };
    }

    public async Task<IReadOnlyCollection<ChatDto>> GetMyChatsAsync(GetMyChatsParameters parameters)
    {
        var chats = await _dbContext.Chats
            .AsNoTracking()
            .Where(c =>
                c.DeletedAt == null &&
                _dbContext.ChatMembers.Any(cm =>
                    cm.ChatId == c.Id &&
                    cm.UserId == parameters.UserId &&
                    cm.LeftAt == null))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        if (chats.Count == 0)
        {
            return Array.Empty<ChatDto>();
        }

        var chatIds = chats.Select(c => c.Id).ToList();

        var activeMembers = await _dbContext.ChatMembers
            .AsNoTracking()
            .Where(cm => chatIds.Contains(cm.ChatId) && cm.LeftAt == null)
            .OrderByDescending(cm => cm.JoinedAt)
            .ToListAsync();

        var membersByChat = activeMembers
            .GroupBy(cm => cm.ChatId)
            .ToDictionary(g => g.Key, g => (IReadOnlyCollection<ChatMemberDto>)g.Select(MapChatMember).ToList());

        return chats
            .Select(c =>
            {
                membersByChat.TryGetValue(c.Id, out var members);
                return MapChat(c, members);
            })
            .ToList();
    }

    public async Task<ChatDto?> GetByIdAsync(GetChatByIdParameters parameters)
    {
        if (!await HasActiveMembershipAsync(parameters.ChatId, parameters.UserId))
        {
            return null;
        }

        var chat = await _dbContext.Chats
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == parameters.ChatId && c.DeletedAt == null);

        if (chat == null)
        {
            return null;
        }

        var members = await _dbContext.ChatMembers
            .AsNoTracking()
            .Where(cm => cm.ChatId == parameters.ChatId && cm.LeftAt == null)
            .OrderByDescending(cm => cm.JoinedAt)
            .Select(cm => MapChatMember(cm))
            .ToListAsync();

        return MapChat(chat, members);
    }

    public async Task<ChatResult> DeleteAsync(DeleteChatParameters parameters)
    {
        var chat = await _dbContext.Chats
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.ChatId &&
                c.DeletedAt == null &&
                c.CreatedBy == parameters.UserId);

        if (chat == null)
        {
            return Error("Chat not found.");
        }

        var now = DateTime.UtcNow;
        chat.DeletedAt = now;

        var activeMembers = await _dbContext.ChatMembers
            .Where(cm => cm.ChatId == chat.Id && cm.LeftAt == null)
            .ToListAsync();

        foreach (var member in activeMembers)
        {
            member.LeftAt = now;
        }

        await _dbContext.SaveChangesAsync();

        return new ChatResult
        {
            Succeeded = true,
            Chat = MapChat(chat, activeMembers.Select(MapChatMember).ToList())
        };
    }

    private async Task<bool> HasActiveMembershipAsync(Guid chatId, string userId)
    {
        return await _dbContext.Chats
            .AsNoTracking()
            .AnyAsync(c =>
                c.Id == chatId &&
                c.DeletedAt == null &&
                _dbContext.ChatMembers.Any(cm =>
                    cm.ChatId == c.Id &&
                    cm.UserId == userId &&
                    cm.LeftAt == null));
    }

    private static ChatDto MapChat(Chat chat, IReadOnlyCollection<ChatMember>? members = null)
    {
        return new ChatDto
        {
            Id = chat.Id,
            CreatedBy = chat.CreatedBy,
            CreatedAt = chat.CreatedAt,
            Members = members?.Select(MapChatMember).ToList()
        };
    }

    private static ChatDto MapChat(Chat chat, IReadOnlyCollection<ChatMemberDto>? members = null)
    {
        return new ChatDto
        {
            Id = chat.Id,
            CreatedBy = chat.CreatedBy,
            CreatedAt = chat.CreatedAt,
            Members = members
        };
    }

    private static ChatMemberDto MapChatMember(ChatMember member)
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

    private static ChatResult Error(string message)
    {
        return new ChatResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }
}
