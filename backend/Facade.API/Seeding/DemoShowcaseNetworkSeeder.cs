using Content.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Parameters.PageAdmin;
using Network.Contracts.Parameters.PageFollower;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Services;
using Network.DataAccess;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseNetworkSeeder : IDemoSeeder
{
    public int Order => 17;

    public string Name => nameof(DemoShowcaseNetworkSeeder);

    private const string StatusAccepted = "accepted";
    private const string StatusPending = "pending";

    private readonly NetworkDbContext _networkDb;
    private readonly ContentDbContext _contentDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly IContactService _contactService;
    private readonly IFollowService _followService;
    private readonly IUserGroupService _userGroupService;
    private readonly IGroupMemberService _groupMemberService;
    private readonly IGroupPostService _groupPostService;
    private readonly IPageService _pageService;
    private readonly IPageAdminService _pageAdminService;
    private readonly IPageFollowerService _pageFollowerService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseNetworkSeeder> _logger;

    public DemoShowcaseNetworkSeeder(
        NetworkDbContext networkDb,
        ContentDbContext contentDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        IContactService contactService,
        IFollowService followService,
        IUserGroupService userGroupService,
        IGroupMemberService groupMemberService,
        IGroupPostService groupPostService,
        IPageService pageService,
        IPageAdminService pageAdminService,
        IPageFollowerService pageFollowerService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseNetworkSeeder> logger)
    {
        _networkDb = networkDb;
        _contentDb = contentDb;
        _identityDb = identityDb;
        _contactService = contactService;
        _followService = followService;
        _userGroupService = userGroupService;
        _groupMemberService = groupMemberService;
        _groupPostService = groupPostService;
        _pageService = pageService;
        _pageAdminService = pageAdminService;
        _pageFollowerService = pageFollowerService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase network seed started.");

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            DemoShowcaseSeedData.ProfileTemplates.Select(t => t.Email),
            cancellationToken);

        if (!users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            _logger.LogWarning("Demo showcase network seed skipped: primary demo user not found.");
            return;
        }

        if (users.TryGetValue(DemoShowcaseSeedData.LucasEmail, out var lucas))
        {
            await EnsureAcceptedContactAsync(lucas, marya, cancellationToken);
            if (users.TryGetValue(DemoShowcaseSeedData.EmmaEmail, out var emma))
            {
                await EnsureAcceptedContactAsync(lucas, emma, cancellationToken);
            }
        }

        if (users.TryGetValue(DemoShowcaseSeedData.TestTwoEmail, out var testTwo))
        {
            await EnsurePendingContactAsync(testTwo, marya, cancellationToken);
        }

        if (users.TryGetValue(DemoShowcaseSeedData.DavidJohnsonEmail, out var davidJohnson))
        {
            await EnsureFollowAsync(marya, davidJohnson, cancellationToken);
        }

        var groupName = $"{marker}UI/UX Design Professionals";
        var group = await EnsureGroupAsync(
            marya,
            groupName,
            $"{marker}Design community group",
            "uiux-group.jpg",
            cancellationToken);

        if (group is not null)
        {
            await EnsureGroupMemberAsync(marya, group.Id, cancellationToken);

            foreach (var memberEmail in new[]
                     {
                         DemoShowcaseSeedData.DavidJonsonEmail,
                         "duncan.callahan@demo.com",
                         "joshua.cortez@demo.com",
                         "jennifer.obrian@demo.com",
                         "emma.knight@demo.com",
                     })
            {
                if (users.TryGetValue(memberEmail, out var member))
                {
                    await EnsureGroupMemberAsync(member, group.Id, cancellationToken);
                }
            }

            await AttachDavidGroupPostAsync(marya, group.Id, marker, cancellationToken);
        }

        var pageName = $"{marker}Google Design";
        var page = await EnsurePageAsync(
            marya,
            pageName,
            $"{marker}Google Design is a cooperative effort led by designers and developers at Google.",
            "google-design.jpg",
            cancellationToken);

        if (page is not null)
        {
            foreach (var adminEmail in new[]
                     {
                         "sarah@google.com",
                         "james@google.com",
                         "emma@google.com",
                         "michael@google.com",
                     })
            {
                if (users.TryGetValue(adminEmail, out var pageAdminUser))
                {
                    await EnsurePageAdminAsync(marya, page.Id, pageAdminUser, cancellationToken);
                }
            }

            foreach (var follower in users.Values.Where(u => u.Id != marya.Id).Take(8))
            {
                await EnsurePageFollowerAsync(follower, page.Id, cancellationToken);
            }
        }

        _logger.LogInformation("Demo showcase network seed finished.");
    }

    private async Task AttachDavidGroupPostAsync(
        ApplicationUser actor,
        Guid groupId,
        string marker,
        CancellationToken cancellationToken)
    {
        var postContent = $"{marker} Just finished redesigning our mobile app onboarding flow!";
        var post = await _contentDb.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.DeletedAt == null && p.Content == postContent, cancellationToken);

        if (post is null)
        {
            return;
        }

        var exists = await _networkDb.GroupPosts
            .AnyAsync(gp => gp.GroupId == groupId && gp.PostId == post.Id, cancellationToken);

        if (exists)
        {
            return;
        }

        await _groupPostService.AttachPostToGroupAsync(new AttachGroupPostParameters
        {
            UserId = actor.Id,
            GroupId = groupId,
            PostId = post.Id,
        });
    }

    private async Task<Network.DataAccess.Entities.UserGroup?> EnsureGroupAsync(
        ApplicationUser owner,
        string name,
        string description,
        string avatarUrl,
        CancellationToken cancellationToken)
    {
        var existing = await _networkDb.UserGroups
            .FirstOrDefaultAsync(
                g => g.DeletedAt == null && g.OwnerId == owner.Id && g.Name == name,
                cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var result = await _userGroupService.CreateAsync(new CreateUserGroupParameters
        {
            OwnerId = owner.Id,
            Name = name,
            Description = description,
            AvatarUrl = avatarUrl,
        });

        if (!result.Succeeded || result.UserGroup is null)
        {
            _logger.LogWarning(
                "Demo showcase network seed: failed to create group {Name}: {Errors}",
                name,
                string.Join(", ", result.Errors));
            return null;
        }

        return await _networkDb.UserGroups.FirstOrDefaultAsync(g => g.Id == result.UserGroup.Id, cancellationToken);
    }

    private async Task EnsureGroupMemberAsync(
        ApplicationUser user,
        Guid groupId,
        CancellationToken cancellationToken)
    {
        var exists = await _networkDb.GroupMembers.AnyAsync(
            m => m.GroupId == groupId && m.UserId == user.Id && m.DeletedAt == null,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _groupMemberService.JoinAsync(new JoinGroupParameters
        {
            UserId = user.Id,
            GroupId = groupId,
        });
    }

    private async Task<Network.DataAccess.Entities.Page?> EnsurePageAsync(
        ApplicationUser owner,
        string name,
        string description,
        string logoUrl,
        CancellationToken cancellationToken)
    {
        var existing = await _networkDb.Pages
            .FirstOrDefaultAsync(
                p => p.DeletedAt == null && p.OwnerId == owner.Id && p.Name == name,
                cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var result = await _pageService.CreateAsync(new CreatePageParameters
        {
            OwnerId = owner.Id,
            Name = name,
            Description = description,
            LogoUrl = logoUrl,
        });

        if (!result.Succeeded || result.Page is null)
        {
            _logger.LogWarning(
                "Demo showcase network seed: failed to create page {Name}: {Errors}",
                name,
                string.Join(", ", result.Errors));
            return null;
        }

        return await _networkDb.Pages.FirstOrDefaultAsync(p => p.Id == result.Page.Id, cancellationToken);
    }

    private async Task EnsurePageAdminAsync(
        ApplicationUser owner,
        Guid pageId,
        ApplicationUser adminUser,
        CancellationToken cancellationToken)
    {
        var exists = await _networkDb.PageAdmins.AnyAsync(
            pa => pa.PageId == pageId && pa.UserId == adminUser.Id && pa.RevokedAt == null,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _pageAdminService.AddAdminAsync(new AddPageAdminParameters
        {
            OwnerId = owner.Id,
            PageId = pageId,
            UserId = adminUser.Id,
        });
    }

    private async Task EnsurePageFollowerAsync(
        ApplicationUser follower,
        Guid pageId,
        CancellationToken cancellationToken)
    {
        var exists = await _networkDb.PageFollowers.AnyAsync(
            pf => pf.PageId == pageId && pf.UserId == follower.Id && pf.UnfollowedAt == null,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _pageFollowerService.FollowPageAsync(new FollowPageParameters
        {
            UserId = follower.Id,
            PageId = pageId,
        });
    }

    private async Task EnsurePendingContactAsync(
        ApplicationUser requester,
        ApplicationUser receiver,
        CancellationToken cancellationToken)
    {
        var existing = await _networkDb.Contacts
            .AsNoTracking()
            .AnyAsync(
                c =>
                    ((c.RequesterId == requester.Id && c.ReceiverId == receiver.Id) ||
                     (c.RequesterId == receiver.Id && c.ReceiverId == requester.Id)) &&
                    (c.Status == StatusAccepted || c.Status == StatusPending),
                cancellationToken);

        if (existing)
        {
            return;
        }

        await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = requester.Id,
            ReceiverId = receiver.Id,
        });
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
            await _contactService.AcceptAsync(new RespondToContactParameters
            {
                UserId = pending.ReceiverId,
                ContactId = pending.Id,
            });
            return;
        }

        var sendResult = await _contactService.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = requester.Id,
            ReceiverId = receiver.Id,
        });

        if (!sendResult.Succeeded || sendResult.Contact is null)
        {
            return;
        }

        await _contactService.AcceptAsync(new RespondToContactParameters
        {
            UserId = receiver.Id,
            ContactId = sendResult.Contact.Id,
        });
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
            return;
        }

        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = follower.Id,
            FollowingId = following.Id,
        });
    }
}
