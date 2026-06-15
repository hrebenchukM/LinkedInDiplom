using Identity.DataAccess.Entities;
using Messaging.Contracts.Parameters.Chat;
using Messaging.Contracts.Parameters.ChatMember;
using Messaging.Contracts.Parameters.Message;
using Messaging.Contracts.Services;
using Messaging.DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseMessagingSeeder
{
    private readonly MessagingDbContext _messagingDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly IChatService _chatService;
    private readonly IChatMemberService _chatMemberService;
    private readonly IMessageService _messageService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseMessagingSeeder> _logger;

    public DemoShowcaseMessagingSeeder(
        MessagingDbContext messagingDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        IChatService chatService,
        IChatMemberService chatMemberService,
        IMessageService messageService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseMessagingSeeder> logger)
    {
        _messagingDb = messagingDb;
        _identityDb = identityDb;
        _chatService = chatService;
        _chatMemberService = chatMemberService;
        _messageService = messageService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase messaging seed started.");

        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            new[]
            {
                DemoShowcaseSeedData.PrimaryDemoUserEmail,
                DemoShowcaseSeedData.EmmaEmail,
            },
            cancellationToken);

        if (!users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            _logger.LogWarning("Demo showcase messaging seed skipped: primary demo user not found.");
            return;
        }

        if (!users.TryGetValue(DemoShowcaseSeedData.EmmaEmail, out var emma))
        {
            _logger.LogWarning("Demo showcase messaging seed skipped: partner user not found.");
            return;
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var existingDemoMessages = await _messagingDb.Messages
            .AsNoTracking()
            .CountAsync(
                m => m.DeletedAt == null && m.SenderId == marya.Id && m.Content.StartsWith(marker),
                cancellationToken);

        if (existingDemoMessages >= 3)
        {
            _logger.LogInformation(
                "Demo showcase messaging seed skipped: {Count} demo message(s) already exist.",
                existingDemoMessages);
            return;
        }

        var chatId = await FindDirectChatIdAsync(marya.Id, emma.Id, cancellationToken);
        if (chatId is null)
        {
            chatId = await CreateDirectChatAsync(marya, emma, cancellationToken);
            if (chatId is null)
            {
                return;
            }
        }
        else
        {
            await EnsureMemberJoinedAsync(chatId.Value, emma.Id, cancellationToken);
        }

        var messagesToSend = new[]
        {
            (UserId: marya.Id, Content: $"{marker} Hi Emma, thanks for connecting on LinkUp!"),
            (UserId: emma.Id, Content: $"{marker} Happy to connect — your design posts look great."),
            (UserId: marya.Id, Content: $"{marker} Let's catch up about the Design Systems Conference."),
        };

        var created = 0;
        foreach (var (userId, content) in messagesToSend)
        {
            var exists = await _messagingDb.Messages
                .AnyAsync(
                    m =>
                        m.ChatId == chatId &&
                        m.SenderId == userId &&
                        m.DeletedAt == null &&
                        m.Content == content,
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            var result = await _messageService.SendAsync(new SendMessageParameters
            {
                UserId = userId,
                ChatId = chatId.Value,
                Content = content,
            });

            if (!result.Succeeded)
            {
                _logger.LogError(
                    "Demo showcase messaging seed: failed to send message: {Errors}",
                    string.Join(", ", result.Errors));
                continue;
            }

            created++;
        }

        _logger.LogInformation("Demo showcase messaging seed finished: {Created} message(s) created.", created);
    }

    private async Task<Guid?> CreateDirectChatAsync(
        ApplicationUser creator,
        ApplicationUser partner,
        CancellationToken cancellationToken)
    {
        var createResult = await _chatService.CreateAsync(new CreateChatParameters
        {
            UserId = creator.Id,
        });

        if (!createResult.Succeeded || createResult.Chat is null)
        {
            _logger.LogError(
                "Demo showcase messaging seed: failed to create chat: {Errors}",
                string.Join(", ", createResult.Errors));
            return null;
        }

        var chatId = createResult.Chat.Id;
        await EnsureMemberJoinedAsync(chatId, partner.Id, cancellationToken);
        return chatId;
    }

    private async Task EnsureMemberJoinedAsync(
        Guid chatId,
        string userId,
        CancellationToken cancellationToken)
    {
        var isMember = await _messagingDb.ChatMembers
            .AnyAsync(
                cm => cm.ChatId == chatId && cm.UserId == userId && cm.LeftAt == null,
                cancellationToken);

        if (isMember)
        {
            return;
        }

        var joinResult = await _chatMemberService.JoinAsync(new JoinChatParameters
        {
            ChatId = chatId,
            UserId = userId,
        });

        if (!joinResult.Succeeded)
        {
            _logger.LogError(
                "Demo showcase messaging seed: failed to join user {UserId} to chat {ChatId}: {Errors}",
                userId,
                chatId,
                string.Join(", ", joinResult.Errors));
        }
    }

    private async Task<Guid?> FindDirectChatIdAsync(
        string userA,
        string userB,
        CancellationToken cancellationToken)
    {
        var chatIdsForA = await _messagingDb.ChatMembers
            .AsNoTracking()
            .Where(cm => cm.UserId == userA && cm.LeftAt == null)
            .Select(cm => cm.ChatId)
            .ToListAsync(cancellationToken);

        if (chatIdsForA.Count == 0)
        {
            return null;
        }

        var sharedChatIds = await _messagingDb.ChatMembers
            .AsNoTracking()
            .Where(cm => cm.UserId == userB && cm.LeftAt == null && chatIdsForA.Contains(cm.ChatId))
            .Select(cm => cm.ChatId)
            .ToListAsync(cancellationToken);

        foreach (var chatId in sharedChatIds)
        {
            var chatActive = await _messagingDb.Chats
                .AsNoTracking()
                .AnyAsync(c => c.Id == chatId && c.DeletedAt == null, cancellationToken);

            if (!chatActive)
            {
                continue;
            }

            var memberCount = await _messagingDb.ChatMembers
                .CountAsync(cm => cm.ChatId == chatId && cm.LeftAt == null, cancellationToken);

            if (memberCount == 2)
            {
                return chatId;
            }
        }

        return null;
    }
}
