using Content.Contracts.Parameters.Post;
using Content.Contracts.Services;
using Content.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoContentSeeder
{
    private const string AdminEmail = "admin@local.dev";
    private const string TestUserOneEmail = "test@example.com";
    private const string TestUserTwoEmail = "test2@example.com";
    private const int MinDemoPosts = 3;

    private readonly ContentDbContext _contentDb;
    private readonly IPostService _postService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoContentSeeder> _logger;

    public DemoContentSeeder(
        ContentDbContext contentDb,
        IPostService postService,
        DemoSeedUserLookup userLookup,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoContentSeeder> logger)
    {
        _contentDb = contentDb;
        _postService = postService;
        _userLookup = userLookup;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo content seed started.");

        var marker = NormalizeMarker(_options.MarkerPrefix);
        var existingDemoPosts = await _contentDb.Posts
            .AsNoTracking()
            .CountAsync(
                p => p.DeletedAt == null && p.Content.StartsWith(marker),
                cancellationToken);

        if (existingDemoPosts >= MinDemoPosts)
        {
            _logger.LogInformation(
                "Demo content seed skipped: {Count} demo post(s) already exist.",
                existingDemoPosts);
            return;
        }

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var postTemplates = new[]
        {
            (Email: AdminEmail, Content: $"{marker} Welcome to LinkUp demo network"),
            (Email: TestUserOneEmail, Content: $"{marker} Frontend integration is live"),
            (Email: TestUserTwoEmail, Content: $"{marker} Backend services are connected"),
        };

        var created = 0;
        foreach (var template in postTemplates)
        {
            var user = _userLookup.TryGet(users, template.Email);
            if (user is null)
            {
                _logger.LogWarning(
                    "Demo content seed: user {Email} was not found; skipped post.",
                    template.Email);
                continue;
            }

            if (await CreatePostIfMissingAsync(user, template.Content, cancellationToken))
            {
                created++;
            }
        }

        _logger.LogInformation("Demo content seed finished: {Created} post(s) created.", created);
    }

    private async Task<bool> CreatePostIfMissingAsync(
        ApplicationUser author,
        string content,
        CancellationToken cancellationToken)
    {
        var exists = await _contentDb.Posts
            .AnyAsync(
                p =>
                    p.DeletedAt == null &&
                    p.UserId == author.Id &&
                    p.Content == content,
                cancellationToken);

        if (exists)
        {
            _logger.LogDebug(
                "Demo content seed: post for {Email} with content already exists; skipped.",
                author.Email);
            return false;
        }

        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = author.Id,
            Content = content,
            Visibility = "public",
        });

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors);
            _logger.LogError(
                "Demo content seed: failed to create post for {Email}: {Errors}",
                author.Email,
                errors);
            return false;
        }

        _logger.LogInformation("Demo content seed: created post for {Email}.", author.Email);
        return true;
    }

    private static string NormalizeMarker(string? markerPrefix)
    {
        var marker = string.IsNullOrWhiteSpace(markerPrefix) ? "demo-seed:" : markerPrefix.Trim();
        return marker.EndsWith(' ') ? marker : marker;
    }
}
