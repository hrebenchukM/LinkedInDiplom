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

public sealed class DemoMessagingSeeder : IDemoSeeder
{
    public int Order => 18;

    public string Name => nameof(DemoMessagingSeeder);

    private const string TestUserOneEmail = DemoSeedConstants.TestUserOneEmail;
    private const string TestUserTwoEmail = DemoSeedConstants.TestUserTwoEmail;

    private readonly MessagingDbContext _messagingDb;
    private readonly IChatService _chatService;
    private readonly IChatMemberService _chatMemberService;
    private readonly IMessageService _messageService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoMessagingSeeder> _logger;

    public DemoMessagingSeeder(
        MessagingDbContext messagingDb,
        IChatService chatService,
        IChatMemberService chatMemberService,
        IMessageService messageService,
        DemoSeedUserLookup userLookup,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoMessagingSeeder> logger)
    {
        _messagingDb = messagingDb;
        _chatService = chatService;
        _chatMemberService = chatMemberService;
        _messageService = messageService;
        _userLookup = userLookup;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo messaging seed started.");

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var testOne = _userLookup.TryGet(users, TestUserOneEmail);
        var testTwo = _userLookup.TryGet(users, TestUserTwoEmail);

        if (testOne is null || testTwo is null)
        {
            _logger.LogWarning(
                "Demo messaging seed skipped: required users {Email1} and/or {Email2} were not found.",
                TestUserOneEmail,
                TestUserTwoEmail);
            return;
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);

        var chatId = await FindDirectChatIdAsync(testOne.Id, testTwo.Id, cancellationToken);
        if (chatId is null)
        {
            chatId = await CreateDirectChatAsync(testOne, testTwo, cancellationToken);
            if (chatId is null)
            {
                return;
            }
        }
        else
        {
            _logger.LogInformation(
                "Demo messaging seed: reusing existing direct chat {ChatId} between demo users.",
                chatId);
            await EnsureMemberJoinedAsync(chatId.Value, testTwo.Id, cancellationToken);
        }

        var messagesToSend = new[]
        {
            (UserId: testOne.Id, Content: $"{marker} Hey, ready for the demo chat?"),
            (UserId: testTwo.Id, Content: $"{marker} Yes, backend seed looks good."),
            (UserId: testOne.Id, Content: $"{marker} Great, let's test SignalR next."),
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
                _logger.LogDebug(
                    "Demo messaging seed: message already exists in chat {ChatId}; skipped.",
                    chatId);
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
                var errors = string.Join(", ", result.Errors);
                _logger.LogError("Demo messaging seed: failed to send message: {Errors}", errors);
                continue;
            }

            created++;
        }

        _logger.LogInformation("Demo messaging seed completed: {Created} message(s) created.", created);
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
            var errors = string.Join(", ", createResult.Errors);
            _logger.LogError("Demo messaging seed: failed to create chat: {Errors}", errors);
            return null;
        }

        var chatId = createResult.Chat.Id;
        _logger.LogInformation("Demo messaging seed: created chat {ChatId}.", chatId);

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
            var errors = string.Join(", ", joinResult.Errors);
            _logger.LogError(
                "Demo messaging seed: failed to join user {UserId} to chat {ChatId}: {Errors}",
                userId,
                chatId,
                errors);
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
