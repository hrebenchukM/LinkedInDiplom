using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Services;
using Network.DataAccess;

namespace Facade.API.Seeding;

public sealed class DemoNetworkSeeder
{
    private const string AdminEmail = "admin@local.dev";
    private const string TestUserOneEmail = "test@example.com";
    private const string TestUserTwoEmail = "test2@example.com";
    private const string StatusAccepted = "accepted";
    private const string StatusPending = "pending";

    private readonly NetworkDbContext _networkDb;
    private readonly IContactService _contactService;
    private readonly IFollowService _followService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoNetworkSeeder> _logger;

    public DemoNetworkSeeder(
        NetworkDbContext networkDb,
        IContactService contactService,
        IFollowService followService,
        DemoSeedUserLookup userLookup,
        ILogger<DemoNetworkSeeder> logger)
    {
        _networkDb = networkDb;
        _contactService = contactService;
        _followService = followService;
        _userLookup = userLookup;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo network seed started.");

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var testOne = _userLookup.TryGet(users, TestUserOneEmail);
        var testTwo = _userLookup.TryGet(users, TestUserTwoEmail);
        var admin = _userLookup.TryGet(users, AdminEmail);

        if (testOne is null || testTwo is null)
        {
            _logger.LogWarning(
                "Demo network seed skipped: required users {Email1} and/or {Email2} were not found.",
                TestUserOneEmail,
                TestUserTwoEmail);
            return;
        }

        await EnsureAcceptedContactAsync(testOne, testTwo, cancellationToken);

        if (admin is null)
        {
            _logger.LogWarning(
                "Demo network seed: follow skipped because admin user {Email} was not found.",
                AdminEmail);
        }
        else
        {
            await EnsureFollowAsync(admin, testOne, cancellationToken);
        }

        await EnsureFollowAsync(testOne, testTwo, cancellationToken);

        _logger.LogInformation("Demo network seed completed.");
    }

    private async Task EnsureAcceptedContactAsync(
        ApplicationUser requester,
        ApplicationUser receiver,
        CancellationToken cancellationToken)
    {
        var existingAccepted = await _networkDb.Contacts
            .AsNoTracking()
            .AnyAsync(
                c =>
                    c.Status == StatusAccepted &&
                    ((c.RequesterId == requester.Id && c.ReceiverId == receiver.Id) ||
                     (c.RequesterId == receiver.Id && c.ReceiverId == requester.Id)),
                cancellationToken);

        if (existingAccepted)
        {
            _logger.LogInformation(
                "Demo network seed: accepted contact between {Email1} and {Email2} already exists; skipped.",
                requester.Email,
                receiver.Email);
            return;
        }

        var pending = await _networkDb.Contacts
            .FirstOrDefaultAsync(
                c =>
                    c.Status == StatusPending &&
                    ((c.RequesterId == requester.Id && c.ReceiverId == receiver.Id) ||
                     (c.RequesterId == receiver.Id && c.ReceiverId == requester.Id)),
                cancellationToken);

        if (pending is not null)
        {
            var accepterId = pending.ReceiverId;
            var acceptResult = await _contactService.AcceptAsync(new RespondToContactParameters
            {
                UserId = accepterId,
                ContactId = pending.Id,
            });

            if (!acceptResult.Succeeded)
            {
                var errors = string.Join(", ", acceptResult.Errors);
                _logger.LogError(
                    "Demo network seed: failed to accept pending contact {ContactId}: {Errors}",
                    pending.Id,
                    errors);
                return;
            }

            _logger.LogInformation(
                "Demo network seed: accepted existing pending contact between {Email1} and {Email2}.",
                requester.Email,
                receiver.Email);
            return;
        }

        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = requester.Id,
            ReceiverId = receiver.Id,
        });

        if (!sendResult.Succeeded || sendResult.Contact is null)
        {
            var errors = string.Join(", ", sendResult.Errors);
            _logger.LogError(
                "Demo network seed: failed to send contact request from {Email1} to {Email2}: {Errors}",
                requester.Email,
                receiver.Email,
                errors);
            return;
        }

        var acceptNewResult = await _contactService.AcceptAsync(new RespondToContactParameters
        {
            UserId = receiver.Id,
            ContactId = sendResult.Contact.Id,
        });

        if (!acceptNewResult.Succeeded)
        {
            var errors = string.Join(", ", acceptNewResult.Errors);
            _logger.LogError(
                "Demo network seed: failed to accept contact request {ContactId}: {Errors}",
                sendResult.Contact.Id,
                errors);
            return;
        }

        _logger.LogInformation(
            "Demo network seed: created and accepted contact between {Email1} and {Email2}.",
            requester.Email,
            receiver.Email);
    }

    private async Task EnsureFollowAsync(
        ApplicationUser follower,
        ApplicationUser following,
        CancellationToken cancellationToken)
    {
        var alreadyFollowing = await _networkDb.Follows
            .AsNoTracking()
            .AnyAsync(
                f =>
                    f.FollowerId == follower.Id &&
                    f.FollowingId == following.Id &&
                    f.UnfollowedAt == null,
                cancellationToken);

        if (alreadyFollowing)
        {
            _logger.LogInformation(
                "Demo network seed: {FollowerEmail} already follows {FollowingEmail}; skipped.",
                follower.Email,
                following.Email);
            return;
        }

        var followResult = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = follower.Id,
            FollowingId = following.Id,
        });

        if (!followResult.Succeeded)
        {
            var errors = string.Join(", ", followResult.Errors);
            _logger.LogError(
                "Demo network seed: failed to create follow {FollowerEmail} -> {FollowingEmail}: {Errors}",
                follower.Email,
                following.Email,
                errors);
            return;
        }

        _logger.LogInformation(
            "Demo network seed: created follow {FollowerEmail} -> {FollowingEmail}.",
            follower.Email,
            following.Email);
    }
}
