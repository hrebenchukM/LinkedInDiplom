using Identity.Contracts.Parameters;
using Identity.Contracts.Services;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only demo contacts and follows so Network pages look populated on a fresh database.
/// Idempotent: skips existing contact/follow pairs.
/// </summary>
public class DemoNetworkSeeder : IDemoNetworkSeeder
{
    private const string StatusPending = "pending";
    private const string StatusAccepted = "accepted";

    private static readonly (string Email, string UserName)[] AnchorDemoUsers =
    [
        ("andrii.rotar@gmail.com", "andrii.rotar"),
    ];

    private static readonly string[] AnchorUserEmails =
    [
        "andrii.rotar@gmail.com",
        "admin@local.dev",
    ];

    private const int AcceptedContactsPerAnchor = 14;
    private const int IncomingPendingPerAnchor = 3;
    private const int OutgoingPendingPerAnchor = 2;
    private const int BotFollowersPerAnchor = 10;

    private readonly NetworkDbContext _networkDb;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserService _userService;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DemoNetworkSeeder> _logger;

    public DemoNetworkSeeder(
        NetworkDbContext networkDb,
        UserManager<ApplicationUser> userManager,
        IUserService userService,
        IHostEnvironment environment,
        ILogger<DemoNetworkSeeder> logger)
    {
        _networkDb = networkDb;
        _userManager = userManager;
        _userService = userService;
        _environment = environment;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_environment.IsDevelopment())
        {
            return;
        }

        await EnsureAnchorDemoUsersAsync(cancellationToken);

        var botUserIds = await ResolveBotUserIdsAsync(cancellationToken);
        if (botUserIds.Count == 0)
        {
            _logger.LogWarning("Demo network seed skipped: no demo bot users found.");
            return;
        }

        var contactsAdded = 0;
        var followsAdded = 0;

        foreach (var anchorEmail in AnchorUserEmails)
        {
            var anchorUser = await _userManager.FindByEmailAsync(anchorEmail);
            if (anchorUser?.Id == null)
            {
                _logger.LogInformation("Demo network seed skipped anchor {Email}: user not found.", anchorEmail);
                continue;
            }

            var anchorOffset = StableOffset(anchorEmail, botUserIds.Count);
            var orderedBots = Rotate(botUserIds, anchorOffset);

            contactsAdded += await SeedContactsForAnchorAsync(
                anchorUser.Id,
                orderedBots,
                cancellationToken);

            followsAdded += await SeedFollowsForAnchorAsync(
                anchorUser.Id,
                orderedBots,
                cancellationToken);
        }

        if (contactsAdded > 0 || followsAdded > 0)
        {
            await _networkDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Seeded demo network graph: {Contacts} contacts, {Follows} follows.",
                contactsAdded,
                followsAdded);
        }
    }

    /// <summary>
    /// Preset demo accounts (Google fallback) must exist before contact seeding on a fresh database.
    /// Admin is created by <see cref="Identity.Services.Seeding.IdentityDataSeeder"/>.
    /// </summary>
    private async Task EnsureAnchorDemoUsersAsync(CancellationToken cancellationToken)
    {
        foreach (var (email, userName) in AnchorDemoUsers)
        {
            var existing = await _userManager.FindByEmailAsync(email);
            if (existing?.Id != null)
            {
                continue;
            }

            var result = await _userService.RegisterAsync(new RegisterUserParameters
            {
                Email = email,
                UserName = userName,
                Password = DemoBotCatalog.BotPassword,
            });

            if (!result.Succeeded || result.User?.Id == null)
            {
                var errors = result.Errors == null ? "unknown error" : string.Join(", ", result.Errors);
                _logger.LogWarning("Demo anchor registration failed for {Email}: {Errors}", email, errors);
                continue;
            }

            _logger.LogInformation("Registered demo anchor user {Email}.", email);
        }
    }

    private async Task<List<string>> ResolveBotUserIdsAsync(CancellationToken cancellationToken)
    {
        var botEmails = DemoBotCatalog.Bots
            .Select(bot => bot.Email)
            .ToArray();

        var users = await _userManager.Users
            .Where(user => botEmails.Contains(user.Email!))
            .Select(user => user.Id)
            .ToListAsync(cancellationToken);

        return users
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }

    private async Task<int> SeedContactsForAnchorAsync(
        string anchorUserId,
        IReadOnlyList<string> orderedBots,
        CancellationToken cancellationToken)
    {
        var added = 0;
        var acceptedCount = Math.Min(AcceptedContactsPerAnchor, orderedBots.Count);
        var incomingStart = acceptedCount;
        var incomingEnd = Math.Min(incomingStart + IncomingPendingPerAnchor, orderedBots.Count);
        var outgoingStart = incomingEnd;
        var outgoingEnd = Math.Min(outgoingStart + OutgoingPendingPerAnchor, orderedBots.Count);

        for (var index = 0; index < acceptedCount; index++)
        {
            var botUserId = orderedBots[index];
            var botRequestsUser = index % 2 == 0;
            var requesterId = botRequestsUser ? botUserId : anchorUserId;
            var receiverId = botRequestsUser ? anchorUserId : botUserId;

            added += await EnsureContactAsync(
                requesterId,
                receiverId,
                StatusAccepted,
                daysAgo: 5 + index * 3,
                cancellationToken);
        }

        for (var index = incomingStart; index < incomingEnd; index++)
        {
            added += await EnsureContactAsync(
                orderedBots[index],
                anchorUserId,
                StatusPending,
                daysAgo: 1 + (index - incomingStart),
                cancellationToken);
        }

        for (var index = outgoingStart; index < outgoingEnd; index++)
        {
            added += await EnsureContactAsync(
                anchorUserId,
                orderedBots[index],
                StatusPending,
                daysAgo: 2 + (index - outgoingStart),
                cancellationToken);
        }

        return added;
    }

    private async Task<int> SeedFollowsForAnchorAsync(
        string anchorUserId,
        IReadOnlyList<string> orderedBots,
        CancellationToken cancellationToken)
    {
        var added = 0;
        var followCount = Math.Min(AcceptedContactsPerAnchor + IncomingPendingPerAnchor, orderedBots.Count);

        for (var index = 0; index < followCount; index++)
        {
            added += await EnsureFollowAsync(
                anchorUserId,
                orderedBots[index],
                daysAgo: 3 + index,
                cancellationToken);
        }

        var followerCount = Math.Min(BotFollowersPerAnchor, orderedBots.Count);
        for (var index = 0; index < followerCount; index++)
        {
            added += await EnsureFollowAsync(
                orderedBots[index],
                anchorUserId,
                daysAgo: 4 + index * 2,
                cancellationToken);
        }

        return added;
    }

    private async Task<int> EnsureContactAsync(
        string requesterId,
        string receiverId,
        string status,
        int daysAgo,
        CancellationToken cancellationToken)
    {
        var pairExists = await _networkDb.Contacts.AnyAsync(
            contact =>
                (contact.RequesterId == requesterId && contact.ReceiverId == receiverId) ||
                (contact.RequesterId == receiverId && contact.ReceiverId == requesterId),
            cancellationToken);

        if (pairExists)
        {
            return 0;
        }

        var requestedAt = DateTime.UtcNow.AddDays(-daysAgo);
        var respondedAt = status == StatusAccepted ? requestedAt.AddHours(6) : (DateTime?)null;

        _networkDb.Contacts.Add(new Contact
        {
            Id = Guid.NewGuid(),
            RequesterId = requesterId,
            ReceiverId = receiverId,
            Status = status,
            RequestedAt = requestedAt,
            RespondedAt = respondedAt,
            StatusChangedAt = respondedAt ?? requestedAt,
        });

        return 1;
    }

    private async Task<int> EnsureFollowAsync(
        string followerId,
        string followingId,
        int daysAgo,
        CancellationToken cancellationToken)
    {
        var existing = await _networkDb.Follows
            .FirstOrDefaultAsync(
                follow => follow.FollowerId == followerId && follow.FollowingId == followingId,
                cancellationToken);

        if (existing != null)
        {
            if (existing.UnfollowedAt == null)
            {
                return 0;
            }

            existing.UnfollowedAt = null;
            existing.FollowedAt = DateTime.UtcNow.AddDays(-daysAgo);
            return 1;
        }

        _networkDb.Follows.Add(new Follow
        {
            Id = Guid.NewGuid(),
            FollowerId = followerId,
            FollowingId = followingId,
            FollowedAt = DateTime.UtcNow.AddDays(-daysAgo),
            UnfollowedAt = null,
        });

        return 1;
    }

    private static int StableOffset(string anchorEmail, int count)
    {
        if (count <= 0)
        {
            return 0;
        }

        var hash = anchorEmail.Aggregate(17, (current, character) => current * 31 + character);
        return Math.Abs(hash) % count;
    }

    private static List<string> Rotate(IReadOnlyList<string> items, int offset)
    {
        if (items.Count == 0)
        {
            return [];
        }

        var normalizedOffset = offset % items.Count;
        return items
            .Skip(normalizedOffset)
            .Concat(items.Take(normalizedOffset))
            .ToList();
    }
}
