using Content.Contracts.Parameters.Comment;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoContentEngagementSeeder
{
    private const string PrimaryDemoUserEmail = DemoShowcaseSeedData.PrimaryDemoUserEmail;
    private const string TestUserOneEmail = "test@example.com";
    private const string TestUserTwoEmail = "test2@example.com";

    private readonly ContentDbContext _contentDb;
    private readonly ICommentService _commentService;
    private readonly IReactionService _reactionService;
    private readonly IPostService _postService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoContentEngagementSeeder> _logger;

    public DemoContentEngagementSeeder(
        ContentDbContext contentDb,
        ICommentService commentService,
        IReactionService reactionService,
        IPostService postService,
        DemoSeedUserLookup userLookup,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoContentEngagementSeeder> logger)
    {
        _contentDb = contentDb;
        _commentService = commentService;
        _reactionService = reactionService;
        _postService = postService;
        _userLookup = userLookup;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo content engagement seed started.");

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var testOne = _userLookup.TryGet(users, TestUserOneEmail);
        var testTwo = _userLookup.TryGet(users, TestUserTwoEmail);
        var primaryDemoUser = _userLookup.TryGet(users, PrimaryDemoUserEmail);

        if (testOne is null || testTwo is null)
        {
            _logger.LogWarning(
                "Demo content engagement seed skipped: required users {Email1} and/or {Email2} were not found.",
                TestUserOneEmail,
                TestUserTwoEmail);
            return;
        }

        var marker = NormalizeMarker(_options.MarkerPrefix);
        var posts = await ResolveTargetPostsAsync(primaryDemoUser, marker, cancellationToken);
        if (posts.Count == 0)
        {
            _logger.LogWarning("Demo content engagement seed skipped: no posts available.");
            return;
        }

        var commentsCreated = await SeedCommentsAsync(posts, testOne, testTwo, primaryDemoUser, marker, cancellationToken);
        var reactionsCreated = await SeedReactionsAsync(posts, testOne, testTwo, primaryDemoUser, cancellationToken);

        _logger.LogInformation(
            "Demo content engagement seed completed: {CommentsCreated} comment(s), {ReactionsCreated} reaction(s) created.",
            commentsCreated,
            reactionsCreated);
    }

    private async Task<IReadOnlyList<Post>> ResolveTargetPostsAsync(
        ApplicationUser? primaryDemoUser,
        string marker,
        CancellationToken cancellationToken)
    {
        var posts = await _contentDb.Posts
            .AsNoTracking()
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.CreatedAt)
            .Take(2)
            .ToListAsync(cancellationToken);

        if (posts.Count >= 2)
        {
            _logger.LogInformation(
                "Demo content engagement seed: using {Count} existing post(s).",
                posts.Count);
            return posts;
        }

        if (posts.Count == 1)
        {
            _logger.LogInformation("Demo content engagement seed: using 1 existing post.");
            return posts;
        }

        if (primaryDemoUser is null)
        {
            _logger.LogWarning(
                "Demo content engagement seed: no posts found and primary demo user {Email} is missing; cannot create demo post.",
                PrimaryDemoUserEmail);
            return Array.Empty<Post>();
        }

        var createResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = primaryDemoUser.Id,
            Content = $"{marker} Welcome to the LinkUp diploma demo feed.",
            Visibility = "public",
        });

        if (!createResult.Succeeded || createResult.Post is null)
        {
            var errors = string.Join(", ", createResult.Errors);
            _logger.LogError("Demo content engagement seed: failed to create demo post: {Errors}", errors);
            return Array.Empty<Post>();
        }

        _logger.LogInformation("Demo content engagement seed: created 1 demo post from primary demo user.");

        return await _contentDb.Posts
            .AsNoTracking()
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.CreatedAt)
            .Take(2)
            .ToListAsync(cancellationToken);
    }

    private async Task<int> SeedCommentsAsync(
        IReadOnlyList<Post> posts,
        ApplicationUser testOne,
        ApplicationUser testTwo,
        ApplicationUser? primaryDemoUser,
        string marker,
        CancellationToken cancellationToken)
    {
        var existingDemoComments = await _contentDb.Comments
            .AsNoTracking()
            .CountAsync(
                c => c.DeletedAt == null && c.Content.StartsWith(marker),
                cancellationToken);

        if (existingDemoComments >= 2)
        {
            _logger.LogInformation(
                "Demo content engagement seed: {Count} demo comment(s) already exist; skipped.",
                existingDemoComments);
            return 0;
        }

        var commentPlans = BuildCommentPlans(posts, testOne, testTwo, primaryDemoUser, marker);
        var created = 0;

        foreach (var plan in commentPlans)
        {
            if (plan.Author is null)
            {
                continue;
            }

            var exists = await _contentDb.Comments
                .AnyAsync(
                    c =>
                        c.PostId == plan.PostId &&
                        c.UserId == plan.Author.Id &&
                        c.DeletedAt == null &&
                        c.Content == plan.Content,
                    cancellationToken);

            if (exists)
            {
                _logger.LogDebug(
                    "Demo content engagement seed: comment on post {PostId} already exists; skipped.",
                    plan.PostId);
                continue;
            }

            var result = await _commentService.CreateAsync(new CreateCommentParameters
            {
                AuthorId = plan.Author.Id,
                PostId = plan.PostId,
                Content = plan.Content,
            });

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors);
                _logger.LogError(
                    "Demo content engagement seed: failed to create comment on post {PostId}: {Errors}",
                    plan.PostId,
                    errors);
                continue;
            }

            created++;
        }

        return created;
    }

    private async Task<int> SeedReactionsAsync(
        IReadOnlyList<Post> posts,
        ApplicationUser testOne,
        ApplicationUser testTwo,
        ApplicationUser? primaryDemoUser,
        CancellationToken cancellationToken)
    {
        var reactionPlans = BuildReactionPlans(posts, testOne, testTwo, primaryDemoUser);
        var created = 0;

        foreach (var plan in reactionPlans)
        {
            if (plan.User is null)
            {
                continue;
            }

            var exists = await _contentDb.Reactions
                .AnyAsync(
                    r => r.PostId == plan.PostId && r.UserId == plan.User.Id,
                    cancellationToken);

            if (exists)
            {
                _logger.LogDebug(
                    "Demo content engagement seed: reaction for user on post {PostId} already exists; skipped.",
                    plan.PostId);
                continue;
            }

            var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
            {
                UserId = plan.User.Id,
                PostId = plan.PostId,
                ReactionType = plan.ReactionType,
            });

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors);
                _logger.LogError(
                    "Demo content engagement seed: failed to create reaction on post {PostId}: {Errors}",
                    plan.PostId,
                    errors);
                continue;
            }

            created++;
        }

        return created;
    }

    private static IReadOnlyList<(Guid PostId, ApplicationUser? Author, string Content)> BuildCommentPlans(
        IReadOnlyList<Post> posts,
        ApplicationUser testOne,
        ApplicationUser testTwo,
        ApplicationUser? primaryDemoUser,
        string marker)
    {
        var plans = new List<(Guid PostId, ApplicationUser? Author, string Content)>();

        if (posts.Count >= 1)
        {
            var post = posts[0];
            var author = PickCommentAuthor(post.UserId, primaryDemoUser, testTwo, testOne);
            plans.Add((post.Id, author, $"{marker} Great post — demo comment #1."));
        }

        if (posts.Count >= 2)
        {
            var post = posts[1];
            var author = PickCommentAuthor(post.UserId, testTwo, primaryDemoUser, testOne);
            plans.Add((post.Id, author, $"{marker} Demo comment #2 from the seed pipeline."));
        }
        else if (posts.Count == 1)
        {
            var post = posts[0];
            var author = PickCommentAuthor(post.UserId, testTwo, primaryDemoUser, testOne);
            plans.Add((post.Id, author, $"{marker} Demo comment #2 on the same post."));
        }

        return plans;
    }

    private static IReadOnlyList<(Guid PostId, ApplicationUser? User, string ReactionType)> BuildReactionPlans(
        IReadOnlyList<Post> posts,
        ApplicationUser testOne,
        ApplicationUser testTwo,
        ApplicationUser? primaryDemoUser)
    {
        var plans = new List<(Guid PostId, ApplicationUser? User, string ReactionType)>();

        if (posts.Count >= 1)
        {
            var post = posts[0];
            var user = PickReactionUser(post.UserId, testOne, testTwo, primaryDemoUser);
            plans.Add((post.Id, user, "like"));
        }

        if (posts.Count >= 2)
        {
            var post = posts[1];
            var user = PickReactionUser(post.UserId, testTwo, testOne, primaryDemoUser);
            plans.Add((post.Id, user, "like"));
        }
        else if (posts.Count == 1)
        {
            var post = posts[0];
            var user = PickReactionUser(post.UserId, testTwo, testOne, primaryDemoUser);
            plans.Add((post.Id, user, "celebrate"));
        }

        return plans;
    }

    private static ApplicationUser? PickCommentAuthor(
        string postAuthorId,
        ApplicationUser? primary,
        ApplicationUser? secondary,
        ApplicationUser? tertiary)
    {
        if (primary is not null && primary.Id != postAuthorId)
        {
            return primary;
        }

        if (secondary is not null && secondary.Id != postAuthorId)
        {
            return secondary;
        }

        if (tertiary is not null && tertiary.Id != postAuthorId)
        {
            return tertiary;
        }

        return null;
    }

    private static ApplicationUser? PickReactionUser(
        string postAuthorId,
        ApplicationUser? primary,
        ApplicationUser? secondary,
        ApplicationUser? fallback)
    {
        return PickCommentAuthor(postAuthorId, primary, secondary, fallback);
    }

    private static string NormalizeMarker(string? markerPrefix)
    {
        var marker = string.IsNullOrWhiteSpace(markerPrefix) ? "demo-seed:" : markerPrefix.Trim();
        return marker.EndsWith(' ') ? marker : marker;
    }
}
