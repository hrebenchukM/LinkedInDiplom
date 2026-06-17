using Content.Contracts.Parameters.Comment;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

/// <summary>
/// Adds reactions and comments from demo/showcase users to bot posts only.
/// Additive to <see cref="DemoContentEngagementSeeder"/> — does not change baseline engagement logic.
/// </summary>
public sealed class DemoBotContentEngagementSeeder
{
    private const int MaxBotPostsToEnrich = 20;
    private const int MaxReactionsPerPost = 2;
    private const int MaxExtraCommentsPerPost = 1;

    private static readonly string[] EngagementUserEmails =
    [
        DemoShowcaseSeedData.PrimaryDemoUserEmail,
        DemoShowcaseSeedData.LucasEmail,
        DemoShowcaseSeedData.TestTwoEmail,
        DemoShowcaseSeedData.EmmaEmail,
        DemoShowcaseSeedData.DavidJonsonEmail,
        "james@demo.com",
        "emma.thompson@demo.com",
    ];

    private static readonly string[] ReactionTypes = ["like", "celebrate", "support", "love", "insightful"];

    private static readonly string[] CommentTemplates =
    [
        "Great update — this is exactly the kind of post I like seeing in my feed.",
        "Thanks for sharing. Really helpful perspective for our team.",
        "Strong post. Saving this for later.",
        "Well said — appreciate the transparency here.",
        "Love the energy in this update. Keep them coming!",
    ];

    private readonly ContentDbContext _contentDb;
    private readonly IdentityDbContext _identityDb;
    private readonly ICommentService _commentService;
    private readonly IReactionService _reactionService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoBotContentEngagementSeeder> _logger;

    public DemoBotContentEngagementSeeder(
        ContentDbContext contentDb,
        IdentityDbContext identityDb,
        ICommentService commentService,
        IReactionService reactionService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoBotContentEngagementSeeder> logger)
    {
        _contentDb = contentDb;
        _identityDb = identityDb;
        _commentService = commentService;
        _reactionService = reactionService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo bot content engagement seed started.");

        var botPosts = await ResolveBotPostsAsync(cancellationToken);
        if (botPosts.Count == 0)
        {
            _logger.LogInformation(
                "Demo bot content engagement seed skipped: no bot posts found.");
            return;
        }

        var engagementUsers = await ResolveEngagementUsersAsync(cancellationToken);
        if (engagementUsers.Count == 0)
        {
            _logger.LogWarning(
                "Demo bot content engagement seed skipped: no demo/showcase users available.");
            return;
        }

        var marker = BuildEngagementMarker(_options.MarkerPrefix);
        var reactionsAdded = 0;
        var reactionsSkipped = 0;
        var commentsAdded = 0;
        var commentsSkipped = 0;

        for (var postIndex = 0; postIndex < botPosts.Count; postIndex++)
        {
            var post = botPosts[postIndex];
            var eligibleUsers = engagementUsers
                .Where(user => !string.Equals(user.Id, post.UserId, StringComparison.Ordinal))
                .ToList();

            if (eligibleUsers.Count == 0)
            {
                continue;
            }

            for (var reactionIndex = 0; reactionIndex < MaxReactionsPerPost; reactionIndex++)
            {
                var user = eligibleUsers[(postIndex + reactionIndex) % eligibleUsers.Count];
                var reactionType = ReactionTypes[(postIndex + reactionIndex) % ReactionTypes.Length];

                var reactionExists = await _contentDb.Reactions
                    .AsNoTracking()
                    .AnyAsync(
                        reaction => reaction.PostId == post.Id && reaction.UserId == user.Id,
                        cancellationToken);

                if (reactionExists)
                {
                    reactionsSkipped++;
                    continue;
                }

                var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
                {
                    UserId = user.Id,
                    PostId = post.Id,
                    ReactionType = reactionType,
                });

                if (result.Succeeded)
                {
                    reactionsAdded++;
                }
                else
                {
                    var errors = string.Join(", ", result.Errors);
                    _logger.LogWarning(
                        "Demo bot content engagement seed: failed reaction on post {PostId}: {Errors}",
                        post.Id,
                        errors);
                }
            }

            for (var commentIndex = 0; commentIndex < MaxExtraCommentsPerPost; commentIndex++)
            {
                var user = eligibleUsers[(postIndex + commentIndex + 1) % eligibleUsers.Count];
                var content = $"{marker}{CommentTemplates[(postIndex + commentIndex) % CommentTemplates.Length]}";

                var commentExists = await _contentDb.Comments
                    .AsNoTracking()
                    .AnyAsync(
                        comment =>
                            comment.PostId == post.Id &&
                            comment.UserId == user.Id &&
                            comment.DeletedAt == null &&
                            comment.Content == content,
                        cancellationToken);

                if (commentExists)
                {
                    commentsSkipped++;
                    continue;
                }

                var result = await _commentService.CreateAsync(new CreateCommentParameters
                {
                    AuthorId = user.Id,
                    PostId = post.Id,
                    Content = content,
                });

                if (result.Succeeded)
                {
                    commentsAdded++;
                }
                else
                {
                    var errors = string.Join(", ", result.Errors);
                    _logger.LogWarning(
                        "Demo bot content engagement seed: failed comment on post {PostId}: {Errors}",
                        post.Id,
                        errors);
                }
            }
        }

        _logger.LogInformation(
            "Demo bot content engagement seed finished: posts {PostCount}; " +
            "reactions added {ReactionsAdded}, skipped {ReactionsSkipped}; " +
            "comments added {CommentsAdded}, skipped {CommentsSkipped}.",
            botPosts.Count,
            reactionsAdded,
            reactionsSkipped,
            commentsAdded,
            commentsSkipped);
    }

    private async Task<IReadOnlyList<Post>> ResolveBotPostsAsync(CancellationToken cancellationToken)
    {
        var botEmails = DemoBotCatalog.Bots
            .Select(bot => bot.Email)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var botUsers = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            botEmails,
            cancellationToken);

        if (botUsers.Count == 0)
        {
            return Array.Empty<Post>();
        }

        var botUserIds = botUsers.Values.Select(user => user.Id).ToHashSet(StringComparer.Ordinal);

        return await _contentDb.Posts
            .AsNoTracking()
            .Where(post => post.DeletedAt == null && botUserIds.Contains(post.UserId))
            .OrderByDescending(post => post.CreatedAt)
            .Take(MaxBotPostsToEnrich)
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<ApplicationUser>> ResolveEngagementUsersAsync(
        CancellationToken cancellationToken)
    {
        var primaryEmail = string.IsNullOrWhiteSpace(_options.PrimaryDemoUserEmail)
            ? DemoShowcaseSeedData.PrimaryDemoUserEmail
            : _options.PrimaryDemoUserEmail.Trim();

        var emails = EngagementUserEmails
            .Append(primaryEmail)
            .Where(email => !string.IsNullOrWhiteSpace(email))
            .Select(email => email.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var usersByEmail = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            emails,
            cancellationToken);

        return usersByEmail.Values.ToList();
    }

    private static string BuildEngagementMarker(string? markerPrefix)
    {
        var marker = DemoSeederSupport.NormalizeMarker(markerPrefix);
        return $"{marker}bot-engagement: ";
    }
}
