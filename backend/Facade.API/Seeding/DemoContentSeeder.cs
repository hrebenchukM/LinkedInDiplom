using Content.DataAccess;
using Content.DataAccess.Entities;
using Identity.Contracts.Parameters;
using Identity.Contracts.Services;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.Contracts.Services;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only demo bots and posts so the home feed looks alive on a fresh database.
/// Idempotent: creates missing bot users/profiles/posts and enriches posts with photos + comments.
/// </summary>
public class DemoContentSeeder : IDemoContentSeeder
{
    private const string VisibilityPublic = "public";
    private const string MediaTypeImage = "image";

    private readonly ContentDbContext _contentDb;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserService _userService;
    private readonly IProfileService _profileService;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DemoContentSeeder> _logger;

    public DemoContentSeeder(
        ContentDbContext contentDb,
        UserManager<ApplicationUser> userManager,
        IUserService userService,
        IProfileService profileService,
        IHostEnvironment environment,
        ILogger<DemoContentSeeder> logger)
    {
        _contentDb = contentDb;
        _userManager = userManager;
        _userService = userService;
        _profileService = profileService;
        _environment = environment;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_environment.IsDevelopment())
        {
            return;
        }

        var botUsers = await EnsureBotUsersAsync(cancellationToken);
        if (botUsers.Count == 0)
        {
            return;
        }

        var botUserIds = botUsers.Values.ToHashSet(StringComparer.Ordinal);
        var existingBotPostCount = await CountActiveBotPostsAsync(botUserIds, cancellationToken);

        if (existingBotPostCount < DemoBotCatalog.TargetPostCount)
        {
            var createdPosts = await CreateMissingPostsAsync(botUsers, cancellationToken);
            if (createdPosts > 0)
            {
                await _contentDb.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Seeded {Count} demo bot posts.", createdPosts);
            }
        }

        var enriched = await EnrichBotPostsAsync(botUsers, cancellationToken);
        if (enriched.postsTouched > 0)
        {
            await _contentDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Enriched demo posts: {Descriptions} descriptions, {Media} images, {Comments} comments, {Counts} count syncs.",
                enriched.descriptionsUpdated,
                enriched.mediaAdded,
                enriched.commentsAdded,
                enriched.countsSynced);
        }
    }

    private async Task<Dictionary<string, string>> EnsureBotUsersAsync(CancellationToken cancellationToken)
    {
        var botUsers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        for (var botIndex = 0; botIndex < DemoBotCatalog.Bots.Length; botIndex++)
        {
            var persona = DemoBotCatalog.Bots[botIndex];
            var userId = await EnsureBotUserAsync(persona, cancellationToken);
            if (userId == null)
            {
                continue;
            }

            botUsers[persona.Email] = userId;
            await EnsureBotProfileAsync(userId, persona, cancellationToken);
        }

        return botUsers;
    }

    private async Task<int> CreateMissingPostsAsync(
        IReadOnlyDictionary<string, string> botUsers,
        CancellationToken cancellationToken)
    {
        var createdPosts = 0;
        var globalPostIndex = 0;

        for (var botIndex = 0; botIndex < DemoBotCatalog.Bots.Length; botIndex++)
        {
            var persona = DemoBotCatalog.Bots[botIndex];
            if (!botUsers.TryGetValue(persona.Email, out var userId))
            {
                continue;
            }

            for (var postIndex = 0; postIndex < persona.Posts.Length; postIndex++)
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

                createdPosts++;
                globalPostIndex++;
            }
        }

        return createdPosts;
    }

    private async Task<(int descriptionsUpdated, int mediaAdded, int commentsAdded, int countsSynced, int postsTouched)> EnrichBotPostsAsync(
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

        var descriptionsUpdated = 0;
        var mediaAdded = 0;
        var commentsAdded = 0;
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
                descriptionsUpdated++;
            }

            if (!await PostHasMediaAsync(post.Id, cancellationToken))
            {
                AttachImageToPost(post, persona, postIndex, post.CreatedAt);
                mediaAdded++;
            }

            commentsAdded += await AddMissingCommentsToPostAsync(
                post,
                DemoBotCatalog.PickComments(globalPostIndex),
                botUsers,
                post.UserId,
                post.CreatedAt,
                cancellationToken);

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

        return (descriptionsUpdated, mediaAdded, commentsAdded, countsSynced, posts.Count);
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

    private int AddCommentsToPost(
        Post post,
        IReadOnlyList<string> commentTexts,
        IReadOnlyDictionary<string, string> botUsers,
        string postAuthorUserId,
        DateTime postCreatedAt)
    {
        var authorIds = PickCommentAuthorIds(botUsers, postAuthorUserId, commentTexts.Count);
        var added = 0;

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
            added++;
        }

        return added;
    }

    private async Task<int> AddMissingCommentsToPostAsync(
        Post post,
        IReadOnlyList<string> commentTexts,
        IReadOnlyDictionary<string, string> botUsers,
        string postAuthorUserId,
        DateTime postCreatedAt,
        CancellationToken cancellationToken)
    {
        var existingCount = await _contentDb.Comments.CountAsync(
            comment => comment.PostId == post.Id && comment.DeletedAt == null,
            cancellationToken);

        if (existingCount >= DemoBotCatalog.CommentsPerPost)
        {
            post.CommentCount = existingCount;
            return 0;
        }

        var authorIds = PickCommentAuthorIds(botUsers, postAuthorUserId, DemoBotCatalog.CommentsPerPost);
        var added = 0;

        for (var index = existingCount; index < DemoBotCatalog.CommentsPerPost; index++)
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

            added++;
        }

        post.CommentCount = existingCount + added;
        return added;
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

    private async Task<HashSet<string>> ResolveBotUserIdsAsync(CancellationToken cancellationToken)
    {
        var emails = DemoBotCatalog.Bots.Select(bot => bot.Email).ToList();
        var userIds = new HashSet<string>(StringComparer.Ordinal);

        foreach (var email in emails)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user?.Id != null)
            {
                userIds.Add(user.Id);
            }
        }

        return userIds;
    }

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

    private async Task<string?> EnsureBotUserAsync(
        DemoBotPersona persona,
        CancellationToken cancellationToken)
    {
        var existing = await _userManager.FindByEmailAsync(persona.Email);
        if (existing?.Id != null)
        {
            return existing.Id;
        }

        var result = await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = persona.UserName,
            Email = persona.Email,
            Password = DemoBotCatalog.BotPassword,
        });

        if (!result.Succeeded || result.User?.Id == null)
        {
            var errors = result.Errors == null ? "unknown error" : string.Join(", ", result.Errors);
            _logger.LogWarning("Demo bot registration failed for {Email}: {Errors}", persona.Email, errors);
            return null;
        }

        _logger.LogInformation("Registered demo bot {Email}.", persona.Email);
        return result.User.Id;
    }

    private async Task EnsureBotProfileAsync(
        string userId,
        DemoBotPersona persona,
        CancellationToken cancellationToken)
    {
        var existing = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        var needsUpdate = existing == null ||
                          string.IsNullOrWhiteSpace(existing.FirstName) ||
                          string.IsNullOrWhiteSpace(existing.Headline);

        if (!needsUpdate)
        {
            return;
        }

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
