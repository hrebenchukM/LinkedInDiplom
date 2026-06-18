using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Facade.API.Seeding;

public sealed partial class DemoBotContentSeeder
{
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
