using Content.Contracts.Parameters.Comment;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Facade.API.Seeding;

public sealed partial class DemoBotContentSeeder
{
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
}
