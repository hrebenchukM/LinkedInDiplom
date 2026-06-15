using Content.Contracts.Parameters.Media;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Services;
using Content.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseContentSeeder
{
    private readonly ContentDbContext _contentDb;
    private readonly IPostService _postService;
    private readonly IMediaService _mediaService;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseContentSeeder> _logger;

    public DemoShowcaseContentSeeder(
        ContentDbContext contentDb,
        IPostService postService,
        IMediaService mediaService,
        Identity.DataAccess.IdentityDbContext identityDb,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseContentSeeder> logger)
    {
        _contentDb = contentDb;
        _postService = postService;
        _mediaService = mediaService;
        _identityDb = identityDb;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase content seed started.");

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            new[]
            {
                DemoShowcaseSeedData.PrimaryDemoUserEmail,
                DemoShowcaseSeedData.LucasEmail,
                DemoShowcaseSeedData.EmmaEmail,
                DemoShowcaseSeedData.DavidJonsonEmail,
            },
            cancellationToken);

        var templates = new (string Email, string Content, string? MediaFile)[]
        {
            (DemoShowcaseSeedData.PrimaryDemoUserEmail, $"{marker} Seed post 1", "post_admin_1.jpg"),
            (DemoShowcaseSeedData.PrimaryDemoUserEmail, $"{marker} Seed post 2", "post_admin_2.jpg"),
            (DemoShowcaseSeedData.PrimaryDemoUserEmail, $"{marker} Seed post 3", "post_admin_3.jpg"),
            (DemoShowcaseSeedData.PrimaryDemoUserEmail, $"{marker} Introducing Material Design 3: The next evolution of Material Design.", null),
            (DemoShowcaseSeedData.PrimaryDemoUserEmail, $"{marker} How we design for billions: A look at Google Design principles.", null),
            (DemoShowcaseSeedData.EmmaEmail, $"{marker} Design is not just what it looks like — it is how it works.", "post_designer_1.jpg"),
            (DemoShowcaseSeedData.LucasEmail, $"{marker} Clean code always looks like it was written by someone who cares.", "post_developer_1.jpg"),
            (DemoShowcaseSeedData.DavidJonsonEmail, $"{marker} Just finished redesigning our mobile app onboarding flow!", null),
        };

        var created = 0;
        foreach (var template in templates)
        {
            if (!users.TryGetValue(template.Email, out var author))
            {
                continue;
            }

            if (await CreatePostIfMissingAsync(author, template.Content, template.MediaFile, cancellationToken))
            {
                created++;
            }
        }

        _logger.LogInformation("Demo showcase content seed finished: {Created} post(s) created.", created);
    }

    private async Task<bool> CreatePostIfMissingAsync(
        ApplicationUser author,
        string content,
        string? mediaFile,
        CancellationToken cancellationToken)
    {
        var exists = await _contentDb.Posts
            .AnyAsync(
                p => p.DeletedAt == null && p.UserId == author.Id && p.Content == content,
                cancellationToken);

        if (exists)
        {
            return false;
        }

        IReadOnlyCollection<Guid>? mediaIds = null;
        if (!string.IsNullOrWhiteSpace(mediaFile))
        {
            var mediaId = await EnsureMediaAsync(mediaFile, cancellationToken);
            if (mediaId.HasValue)
            {
                mediaIds = [mediaId.Value];
            }
        }

        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = author.Id,
            Content = content,
            Visibility = "public",
            MediaIds = mediaIds,
        });

        if (!result.Succeeded)
        {
            _logger.LogError(
                "Demo showcase content seed: failed to create post for {Email}: {Errors}",
                author.Email,
                string.Join(", ", result.Errors));
            return false;
        }

        _logger.LogInformation("Demo showcase content seed: created post for {Email}.", author.Email);
        return true;
    }

    private async Task<Guid?> EnsureMediaAsync(string fileName, CancellationToken cancellationToken)
    {
        var url = $"demo/{fileName}";
        var existing = await _contentDb.Media
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Url == url, cancellationToken);

        if (existing is not null)
        {
            return existing.Id;
        }

        var result = await _mediaService.CreateAsync(new CreateMediaParameters
        {
            Url = url,
            Type = "image",
        });

        return result.Succeeded ? result.Media?.Id : null;
    }
}
