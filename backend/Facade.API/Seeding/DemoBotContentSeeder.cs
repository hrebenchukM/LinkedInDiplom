using Content.Contracts.Parameters.Comment;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Identity.Contracts.Constants;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Services;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only bot users, profiles, posts and comments so the home feed looks alive on a fresh database.
/// Additive to <see cref="DemoContentSeeder"/> — does not replace baseline seed data.
/// </summary>
public sealed class DemoBotContentSeeder
{
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

    private async Task<(Dictionary<string, string> BotUsers, int Added, int Skipped)> EnsureBotUsersAsync(
        CancellationToken cancellationToken)
    {
        var botUsers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var added = 0;
        var skipped = 0;
        var processedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var persona in DemoBotCatalog.Bots)
        {
            if (!processedEmails.Add(persona.Email))
            {
                continue;
            }

            var existing = await _userManager.FindByEmailAsync(persona.Email);
            if (existing?.Id != null && existing.DeletedAt == null)
            {
                botUsers[persona.Email] = existing.Id;
                skipped++;
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = persona.UserName,
                Email = persona.Email,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
            };

            var createResult = await _userManager.CreateAsync(user, _options.DefaultUserPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(error => error.Description));
                _logger.LogWarning(
                    "Demo bot content seed: failed to create user {Email}: {Errors}",
                    persona.Email,
                    errors);
                continue;
            }

            var roleResult = await _userManager.AddToRoleAsync(user, IdentityRoleNames.User);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(error => error.Description));
                _logger.LogWarning(
                    "Demo bot content seed: failed to assign User role to {Email}: {Errors}",
                    persona.Email,
                    errors);
            }

            await _eventPublisher.PublishAsync(
                new UserRegisteredEvent
                {
                    UserId = user.Id,
                    UserName = user.UserName!,
                    Email = user.Email!,
                    RegisteredAt = user.CreatedAt,
                },
                cancellationToken);

            botUsers[persona.Email] = user.Id;
            added++;
            _logger.LogInformation("Demo bot content seed: registered bot {Email}.", persona.Email);
        }

        return (botUsers, added, skipped);
    }

    private async Task<(int Added, int Updated, int Skipped)> EnsureBotProfilesAsync(
        IReadOnlyDictionary<string, string> botUsers,
        CancellationToken cancellationToken)
    {
        var added = 0;
        var updated = 0;
        var skipped = 0;
        var processedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var persona in DemoBotCatalog.Bots)
        {
            if (!processedEmails.Add(persona.Email))
            {
                continue;
            }

            if (!botUsers.TryGetValue(persona.Email, out var userId))
            {
                continue;
            }

            var existing = await _profileService.GetAsync(new GetProfileByUserIdParameters
            {
                UserId = userId,
            });

            var needsUpdate = existing == null ||
                              string.IsNullOrWhiteSpace(existing.FirstName) ||
                              string.IsNullOrWhiteSpace(existing.Headline);

            if (!needsUpdate)
            {
                skipped++;
                continue;
            }

            var isNew = existing == null;
            var profile = existing ?? new UserProfileDto
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            };

            await _profileService.UpdateAsync(profile with
            {
                FirstName = persona.FirstName,
                LastName = persona.LastName,
                FullName = $"{persona.FirstName} {persona.LastName}".Trim(),
                Headline = persona.Headline,
                ProfileTitle = persona.Headline,
                Location = persona.Location,
                AvatarUrl = DemoBotCatalog.AvatarUrlFor(persona.UserName),
                GenInfo = $"Demo profile for {persona.FirstName} {persona.LastName}.",
            });

            if (isNew)
            {
                added++;
            }
            else
            {
                updated++;
            }
        }

        return (added, updated, skipped);
    }

    private async Task<(int Added, int Skipped)> CreateMissingPostsAsync(
        IReadOnlyDictionary<string, string> botUsers,
        int maxToCreate,
        CancellationToken cancellationToken)
    {
        var added = 0;
        var skipped = 0;
        var globalPostIndex = 0;

        for (var botIndex = 0; botIndex < DemoBotCatalog.Bots.Length && added < maxToCreate; botIndex++)
        {
            var persona = DemoBotCatalog.Bots[botIndex];
            if (!botUsers.TryGetValue(persona.Email, out var userId))
            {
                globalPostIndex += persona.Posts.Length;
                continue;
            }

            for (var postIndex = 0; postIndex < persona.Posts.Length && added < maxToCreate; postIndex++)
            {
                var baseContent = persona.Posts[postIndex];
                var enrichedContent = DemoBotCatalog.EnrichPostContent(
                    baseContent,
                    DemoBotCatalog.ImageCaptionFor(persona, postIndex));

                var alreadyExists = await _contentDb.Posts.AnyAsync(
                    post =>
                        post.UserId == userId &&
                        post.DeletedAt == null &&
                        (post.Content == baseContent || post.Content == enrichedContent),
                    cancellationToken);

                if (alreadyExists)
                {
                    skipped++;
                    globalPostIndex++;
                    continue;
                }

                var createdAt = BuildCreatedAt(botIndex, postIndex);
                var post = new Post
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Content = enrichedContent,
                    Visibility = VisibilityPublic,
                    ReactionCount = Random.Shared.Next(3, 48),
                    CommentCount = 0,
                    RepostCount = Random.Shared.Next(0, 8),
                    CreatedAt = createdAt,
                    EditedAt = null,
                    DeletedAt = null,
                };

                _contentDb.Posts.Add(post);
                AttachImageToPost(post, persona, postIndex, createdAt);
                AddCommentsToPost(
                    post,
                    DemoBotCatalog.PickComments(globalPostIndex),
                    botUsers,
                    userId,
                    createdAt);

                added++;
                globalPostIndex++;
            }
        }

        return (added, skipped);
    }

    private async Task<(int CommentsAdded, int CommentsSkipped, int MediaAdded, int CountsSynced)> EnrichBotPostsAsync(
        IReadOnlyDictionary<string, string> botUsers,
        CancellationToken cancellationToken)
    {
        var botUserIds = botUsers.Values.ToList();
        var emailByUserId = botUsers.ToDictionary(pair => pair.Value, pair => pair.Key, StringComparer.Ordinal);

        var posts = await _contentDb.Posts
            .Where(post => post.DeletedAt == null && botUserIds.Contains(post.UserId))
            .OrderBy(post => post.UserId)
            .ThenBy(post => post.CreatedAt)
            .ToListAsync(cancellationToken);

        var commentsAdded = 0;
        var commentsSkipped = 0;
        var mediaAdded = 0;
        var countsSynced = 0;
        var globalPostIndex = 0;

        foreach (var post in posts)
        {
            if (!emailByUserId.TryGetValue(post.UserId, out var email))
            {
                globalPostIndex++;
                continue;
            }

            var persona = DemoBotCatalog.FindPersonaByEmail(email);
            if (persona == null)
            {
                globalPostIndex++;
                continue;
            }

            var baseContent = DemoBotCatalog.StripEnrichedCaption(post.Content);
            var postIndex = Array.FindIndex(
                persona.Posts,
                item => string.Equals(item.Trim(), baseContent, StringComparison.Ordinal));

            if (postIndex < 0)
            {
                postIndex = globalPostIndex % Math.Max(persona.Posts.Length, 1);
            }

            var enrichedContent = DemoBotCatalog.EnrichPostContent(
                baseContent,
                DemoBotCatalog.ImageCaptionFor(persona, postIndex));

            if (!string.Equals(post.Content, enrichedContent, StringComparison.Ordinal))
            {
                post.Content = enrichedContent;
            }

            if (!await PostHasMediaAsync(post.Id, cancellationToken))
            {
                AttachImageToPost(post, persona, postIndex, post.CreatedAt);
                mediaAdded++;
            }

            var (added, skipped) = await AddMissingCommentsToPostAsync(
                post,
                DemoBotCatalog.PickComments(globalPostIndex),
                botUsers,
                post.UserId,
                cancellationToken);

            commentsAdded += added;
            commentsSkipped += skipped;

            var actualCommentCount = await _contentDb.Comments.CountAsync(
                comment => comment.PostId == post.Id && comment.DeletedAt == null,
                cancellationToken);

            if (post.CommentCount != actualCommentCount)
            {
                post.CommentCount = actualCommentCount;
                countsSynced++;
            }

            globalPostIndex++;
        }

        return (commentsAdded, commentsSkipped, mediaAdded, countsSynced);
    }

    private void AttachImageToPost(Post post, DemoBotPersona persona, int postIndex, DateTime createdAt)
    {
        var media = new Media
        {
            Id = Guid.NewGuid(),
            Url = DemoBotCatalog.ImageUrlFor(persona, postIndex),
            Type = MediaTypeImage,
            CreatedAt = createdAt,
        };

        _contentDb.Media.Add(media);
        _contentDb.PostMedia.Add(new PostMedia
        {
            Id = Guid.NewGuid(),
            PostId = post.Id,
            MediaId = media.Id,
            CreatedAt = createdAt,
        });
    }

    private void AddCommentsToPost(
        Post post,
        IReadOnlyList<string> commentTexts,
        IReadOnlyDictionary<string, string> botUsers,
        string postAuthorUserId,
        DateTime postCreatedAt)
    {
        var authorIds = PickCommentAuthorIds(botUsers, postAuthorUserId, commentTexts.Count);

        for (var index = 0; index < commentTexts.Count && index < DemoBotCatalog.CommentsPerPost; index++)
        {
            _contentDb.Comments.Add(new Comment
            {
                Id = Guid.NewGuid(),
                PostId = post.Id,
                UserId = authorIds[index],
                ParentCommentId = null,
                Content = commentTexts[index],
                CreatedAt = postCreatedAt.AddHours(2 + index * 5),
                UpdatedAt = null,
                DeletedAt = null,
            });

            post.CommentCount += 1;
        }
    }

    private async Task<(int Added, int Skipped)> AddMissingCommentsToPostAsync(
        Post post,
        IReadOnlyList<string> commentTexts,
        IReadOnlyDictionary<string, string> botUsers,
        string postAuthorUserId,
        CancellationToken cancellationToken)
    {
        var existingCount = await _contentDb.Comments.CountAsync(
            comment => comment.PostId == post.Id && comment.DeletedAt == null,
            cancellationToken);

        if (existingCount >= DemoBotCatalog.CommentsPerPost)
        {
            return (0, DemoBotCatalog.CommentsPerPost);
        }

        var authorIds = PickCommentAuthorIds(botUsers, postAuthorUserId, DemoBotCatalog.CommentsPerPost);
        var added = 0;
        var skipped = 0;

        for (var index = existingCount; index < DemoBotCatalog.CommentsPerPost; index++)
        {
            var content = commentTexts[index];
            var authorId = authorIds[index];

            var exists = await _contentDb.Comments.AnyAsync(
                comment =>
                    comment.PostId == post.Id &&
                    comment.UserId == authorId &&
                    comment.Content == content &&
                    comment.DeletedAt == null,
                cancellationToken);

            if (exists)
            {
                skipped++;
                continue;
            }

            var result = await _commentService.CreateAsync(new CreateCommentParameters
            {
                AuthorId = authorId,
                PostId = post.Id,
                Content = content,
            });

            if (result.Succeeded)
            {
                added++;
            }
            else
            {
                var errors = result.Errors == null ? "unknown error" : string.Join(", ", result.Errors);
                _logger.LogWarning(
                    "Demo bot content seed: failed to add comment on post {PostId}: {Errors}",
                    post.Id,
                    errors);
            }
        }

        return (added, skipped);
    }

    private static List<string> PickCommentAuthorIds(
        IReadOnlyDictionary<string, string> botUsers,
        string postAuthorUserId,
        int count)
    {
        var pool = botUsers.Values
            .Where(userId => !string.Equals(userId, postAuthorUserId, StringComparison.Ordinal))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (pool.Count == 0)
        {
            return Enumerable.Repeat(postAuthorUserId, count).ToList();
        }

        var offset = Math.Abs(postAuthorUserId.GetHashCode(StringComparison.Ordinal)) % pool.Count;
        var authors = new List<string>(count);

        for (var index = 0; index < count; index++)
        {
            authors.Add(pool[(offset + index) % pool.Count]);
        }

        return authors;
    }

    private Task<bool> PostHasMediaAsync(Guid postId, CancellationToken cancellationToken) =>
        _contentDb.PostMedia.AnyAsync(link => link.PostId == postId, cancellationToken);

    private Task<int> CountActiveBotPostsAsync(
        IReadOnlyCollection<string> botUserIds,
        CancellationToken cancellationToken)
    {
        if (botUserIds.Count == 0)
        {
            return Task.FromResult(0);
        }

        return _contentDb.Posts.CountAsync(
            post => post.DeletedAt == null && botUserIds.Contains(post.UserId),
            cancellationToken);
    }

    private static DateTime BuildCreatedAt(int botIndex, int postIndex)
    {
        var dayOffset = 1 + botIndex + postIndex * 2;
        var hourOffset = (botIndex * 3 + postIndex * 5) % 20;
        var minuteOffset = (botIndex * 11 + postIndex * 7) % 55;

        return DateTime.UtcNow
            .AddDays(-dayOffset)
            .AddHours(-hourOffset)
            .AddMinutes(-minuteOffset);
    }
}
