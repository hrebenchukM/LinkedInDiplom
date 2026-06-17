using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Services;
using Network.DataAccess;

namespace Facade.API.Seeding;

/// <summary>
/// Links demo bot users to the primary demo user via follows and contacts.
/// Additive to <see cref="DemoNetworkSeeder"/> — does not replace baseline/showcase network seeders.
/// </summary>
public sealed class DemoBotNetworkSeeder
{
    private const string StatusAccepted = "accepted";
    private const string StatusPending = "pending";

    private const int PrimaryFollowsBotCount = 8;
    private const int BotsFollowPrimaryCount = 8;
    private const int AcceptedContactCount = 5;
    private const int IncomingPendingCount = 2;
    private const int OutgoingPendingCount = 2;

    private readonly NetworkDbContext _networkDb;
    private readonly IdentityDbContext _identityDb;
    private readonly IContactService _contactService;
    private readonly IFollowService _followService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoBotNetworkSeeder> _logger;

    public DemoBotNetworkSeeder(
        NetworkDbContext networkDb,
        IdentityDbContext identityDb,
        IContactService contactService,
        IFollowService followService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoBotNetworkSeeder> logger)
    {
        _networkDb = networkDb;
        _identityDb = identityDb;
        _contactService = contactService;
        _followService = followService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo bot network seed started.");

        var primaryEmail = string.IsNullOrWhiteSpace(_options.PrimaryDemoUserEmail)
            ? DemoShowcaseSeedData.PrimaryDemoUserEmail
            : _options.PrimaryDemoUserEmail.Trim();

        var primaryUsers = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            [primaryEmail],
            cancellationToken);

        if (!primaryUsers.TryGetValue(primaryEmail, out var primary))
        {
            _logger.LogWarning(
                "Demo bot network seed skipped: primary demo user {Email} was not found.",
                primaryEmail);
            return;
        }

        var botEmails = DemoBotCatalog.Bots
            .Select(bot => bot.Email)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(email => email, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var botUsersByEmail = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            botEmails,
            cancellationToken);

        var orderedBots = botEmails
            .Where(botUsersByEmail.ContainsKey)
            .Select(email => botUsersByEmail[email])
            .ToList();

        if (orderedBots.Count == 0)
        {
            _logger.LogInformation(
                "Demo bot network seed skipped: no bot users found for {Domain}.",
                DemoBotCatalog.BotEmailDomain);
            return;
        }

        var followsAdded = 0;
        var followsSkipped = 0;
        var contactsAdded = 0;
        var contactsSkipped = 0;

        for (var index = 0; index < Math.Min(PrimaryFollowsBotCount, orderedBots.Count); index++)
        {
            var (added, skipped) = await EnsureFollowAsync(primary, orderedBots[index], cancellationToken);
            followsAdded += added;
            followsSkipped += skipped;
        }

        for (var index = 0; index < Math.Min(BotsFollowPrimaryCount, orderedBots.Count); index++)
        {
            var (added, skipped) = await EnsureFollowAsync(orderedBots[index], primary, cancellationToken);
            followsAdded += added;
            followsSkipped += skipped;
        }

        for (var index = 0; index < Math.Min(AcceptedContactCount, orderedBots.Count); index++)
        {
            var bot = orderedBots[index];
            var requester = index % 2 == 0 ? bot : primary;
            var receiver = index % 2 == 0 ? primary : bot;

            var (added, skipped) = await EnsureAcceptedContactAsync(requester, receiver, cancellationToken);
            contactsAdded += added;
            contactsSkipped += skipped;
        }

        var incomingStart = AcceptedContactCount;
        for (var index = 0; index < IncomingPendingCount; index++)
        {
            var botIndex = incomingStart + index;
            if (botIndex >= orderedBots.Count)
            {
                break;
            }

            var (added, skipped) = await EnsurePendingContactAsync(
                orderedBots[botIndex],
                primary,
                cancellationToken);

            contactsAdded += added;
            contactsSkipped += skipped;
        }

        var outgoingStart = incomingStart + IncomingPendingCount;
        for (var index = 0; index < OutgoingPendingCount; index++)
        {
            var botIndex = outgoingStart + index;
            if (botIndex >= orderedBots.Count)
            {
                break;
            }

            var (added, skipped) = await EnsurePendingContactAsync(
                primary,
                orderedBots[botIndex],
                cancellationToken);

            contactsAdded += added;
            contactsSkipped += skipped;
        }

        _logger.LogInformation(
            "Demo bot network seed finished: follows added {FollowsAdded}, skipped {FollowsSkipped}; " +
            "contacts added {ContactsAdded}, skipped {ContactsSkipped}.",
            followsAdded,
            followsSkipped,
            contactsAdded,
            contactsSkipped);
    }

    private async Task<(int Added, int Skipped)> EnsureFollowAsync(
        ApplicationUser follower,
        ApplicationUser following,
        CancellationToken cancellationToken)
    {
        if (string.Equals(follower.Id, following.Id, StringComparison.Ordinal))
        {
            return (0, 1);
        }

        var alreadyFollowing = await _networkDb.Follows
            .AsNoTracking()
            .AnyAsync(
                follow =>
                    follow.FollowerId == follower.Id &&
                    follow.FollowingId == following.Id &&
                    follow.UnfollowedAt == null,
                cancellationToken);

        if (alreadyFollowing)
        {
            return (0, 1);
        }

        var result = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = follower.Id,
            FollowingId = following.Id,
        });

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors);
            _logger.LogWarning(
                "Demo bot network seed: failed follow {FollowerEmail} -> {FollowingEmail}: {Errors}",
                follower.Email,
                following.Email,
                errors);
            return (0, 0);
        }

        return (1, 0);
    }

    private async Task<(int Added, int Skipped)> EnsureAcceptedContactAsync(
        ApplicationUser requester,
        ApplicationUser receiver,
        CancellationToken cancellationToken)
    {
        if (await HasContactAsync(requester.Id, receiver.Id, StatusAccepted, cancellationToken))
        {
            return (0, 1);
        }

        var pending = await FindPendingContactAsync(requester.Id, receiver.Id, cancellationToken);
        if (pending is not null)
        {
            var acceptResult = await _contactService.AcceptAsync(new RespondToContactParameters
            {
                UserId = pending.ReceiverId,
                ContactId = pending.Id,
            });

            if (!acceptResult.Succeeded)
            {
                var errors = string.Join(", ", acceptResult.Errors);
                _logger.LogWarning(
                    "Demo bot network seed: failed to accept pending contact {ContactId}: {Errors}",
                    pending.Id,
                    errors);
                return (0, 0);
            }

            return (1, 0);
        }

        if (await HasAnyContactAsync(requester.Id, receiver.Id, cancellationToken))
        {
            return (0, 1);
        }

        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = requester.Id,
            ReceiverId = receiver.Id,
        });

        if (!sendResult.Succeeded || sendResult.Contact is null)
        {
            var errors = string.Join(", ", sendResult.Errors);
            _logger.LogWarning(
                "Demo bot network seed: failed contact request {RequesterEmail} -> {ReceiverEmail}: {Errors}",
                requester.Email,
                receiver.Email,
                errors);
            return (0, 0);
        }

        var acceptNewResult = await _contactService.AcceptAsync(new RespondToContactParameters
        {
            UserId = receiver.Id,
            ContactId = sendResult.Contact.Id,
        });

        if (!acceptNewResult.Succeeded)
        {
            var errors = string.Join(", ", acceptNewResult.Errors);
            _logger.LogWarning(
                "Demo bot network seed: failed to accept contact {ContactId}: {Errors}",
                sendResult.Contact.Id,
                errors);
            return (0, 0);
        }

        return (1, 0);
    }

    private async Task<(int Added, int Skipped)> EnsurePendingContactAsync(
        ApplicationUser requester,
        ApplicationUser receiver,
        CancellationToken cancellationToken)
    {
        if (await HasContactAsync(requester.Id, receiver.Id, StatusAccepted, cancellationToken))
        {
            return (0, 1);
        }

        if (await HasContactAsync(requester.Id, receiver.Id, StatusPending, cancellationToken))
        {
            return (0, 1);
        }

        if (await HasAnyContactAsync(requester.Id, receiver.Id, cancellationToken))
        {
            return (0, 1);
        }

        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = requester.Id,
            ReceiverId = receiver.Id,
        });

        if (!sendResult.Succeeded)
        {
            var errors = string.Join(", ", sendResult.Errors);
            _logger.LogWarning(
                "Demo bot network seed: failed pending contact {RequesterEmail} -> {ReceiverEmail}: {Errors}",
                requester.Email,
                receiver.Email,
                errors);
            return (0, 0);
        }

        return (1, 0);
    }

    private Task<bool> HasContactAsync(
        string requesterId,
        string receiverId,
        string status,
        CancellationToken cancellationToken) =>
        _networkDb.Contacts
            .AsNoTracking()
            .AnyAsync(
                contact =>
                    contact.Status == status &&
                    ((contact.RequesterId == requesterId && contact.ReceiverId == receiverId) ||
                     (contact.RequesterId == receiverId && contact.ReceiverId == requesterId)),
                cancellationToken);

    private Task<bool> HasAnyContactAsync(
        string userAId,
        string userBId,
        CancellationToken cancellationToken) =>
        _networkDb.Contacts
            .AsNoTracking()
            .AnyAsync(
                contact =>
                    (contact.RequesterId == userAId && contact.ReceiverId == userBId) ||
                    (contact.RequesterId == userBId && contact.ReceiverId == userAId),
                cancellationToken);

    private Task<Network.DataAccess.Entities.Contact?> FindPendingContactAsync(
        string requesterId,
        string receiverId,
        CancellationToken cancellationToken) =>
        _networkDb.Contacts
            .FirstOrDefaultAsync(
                contact =>
                    contact.Status == StatusPending &&
                    ((contact.RequesterId == requesterId && contact.ReceiverId == receiverId) ||
                     (contact.RequesterId == receiverId && contact.ReceiverId == requesterId)),
                cancellationToken);
}
