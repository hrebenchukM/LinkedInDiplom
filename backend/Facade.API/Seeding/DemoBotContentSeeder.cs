using Content.Contracts.Services;
using Content.DataAccess;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Profile.Contracts.Services;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only bot users, profiles, posts and comments so the home feed looks alive on a fresh database.
/// Additive to <see cref="DemoContentSeeder"/> — does not replace baseline seed data.
/// </summary>
public sealed partial class DemoBotContentSeeder : IDemoSeeder
{
    public int Order => 7;

    public string Name => nameof(DemoBotContentSeeder);

    private const string VisibilityPublic = "public";
    private const string MediaTypeImage = "image";

    private readonly ContentDbContext _contentDb;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IProfileService _profileService;
    private readonly ICommentService _commentService;
    private readonly IDomainEventPublisher _eventPublisher;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoBotContentSeeder> _logger;

    public DemoBotContentSeeder(
        ContentDbContext contentDb,
        UserManager<ApplicationUser> userManager,
        IProfileService profileService,
        ICommentService commentService,
        IDomainEventPublisher eventPublisher,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoBotContentSeeder> logger)
    {
        _contentDb = contentDb;
        _userManager = userManager;
        _profileService = profileService;
        _commentService = commentService;
        _eventPublisher = eventPublisher;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo bot content seed started.");

        if (string.IsNullOrWhiteSpace(_options.DefaultUserPassword))
        {
            _logger.LogWarning(
                "Demo bot content seed skipped: DemoSeed:DefaultUserPassword is not configured.");
            return;
        }

        var (botUsers, usersAdded, usersSkipped) = await EnsureBotUsersAsync(cancellationToken);
        if (botUsers.Count == 0)
        {
            _logger.LogWarning("Demo bot content seed skipped: no bot users available.");
            return;
        }

        var (profilesAdded, profilesUpdated, profilesSkipped) =
            await EnsureBotProfilesAsync(botUsers, cancellationToken);

        var botUserIds = botUsers.Values.ToHashSet(StringComparer.Ordinal);
        var existingBotPostCount = await CountActiveBotPostsAsync(botUserIds, cancellationToken);

        var postsAdded = 0;
        var postsSkipped = 0;

        if (existingBotPostCount < DemoBotCatalog.TargetPostCount)
        {
            (postsAdded, postsSkipped) = await CreateMissingPostsAsync(
                botUsers,
                DemoBotCatalog.TargetPostCount - existingBotPostCount,
                cancellationToken);

            if (postsAdded > 0)
            {
                await _contentDb.SaveChangesAsync(cancellationToken);
            }
        }
        else
        {
            postsSkipped = DemoBotCatalog.TargetPostCount;
        }

        var (commentsAdded, commentsSkipped, mediaAdded, countsSynced) =
            await EnrichBotPostsAsync(botUsers, cancellationToken);

        if (commentsAdded > 0 || mediaAdded > 0 || countsSynced > 0)
        {
            await _contentDb.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation(
            "Demo bot content seed finished: users added {UsersAdded}, skipped {UsersSkipped}; " +
            "profiles added {ProfilesAdded}, updated {ProfilesUpdated}, skipped {ProfilesSkipped}; " +
            "posts added {PostsAdded}, skipped {PostsSkipped}; " +
            "comments added {CommentsAdded}, skipped {CommentsSkipped}; media added {MediaAdded}.",
            usersAdded,
            usersSkipped,
            profilesAdded,
            profilesUpdated,
            profilesSkipped,
            postsAdded,
            postsSkipped,
            commentsAdded,
            commentsSkipped,
            mediaAdded);
    }
}
