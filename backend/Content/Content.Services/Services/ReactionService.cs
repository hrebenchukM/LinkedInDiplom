using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Reaction;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Content.Events.Contracts.Events;
using Identity.Events.Contracts.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис реакций на посты
public class ReactionService : IReactionService
{
    private const string VisibilityPrivate = "private";

    private static readonly HashSet<string> AllowedReactionTypes = new(StringComparer.Ordinal)
    {
        "like",
        "celebrate",
        "support",
        "love",
        "insightful",
        "funny"
    };

    private readonly ContentDbContext _dbContext;
    private readonly IDomainEventPublisher _domainEventPublisher;

    public ReactionService(
        ContentDbContext dbContext,
        IDomainEventPublisher domainEventPublisher)
    {
        _dbContext = dbContext;
        _domainEventPublisher = domainEventPublisher;
    }

    public async Task<ReactionResult> UpsertAsync(UpsertReactionParameters parameters)
    {
        var reactionType = parameters.ReactionType.Trim().ToLowerInvariant();

        if (string.IsNullOrEmpty(reactionType))
        {
            return Error("Invalid reaction type.");
        }

        if (!AllowedReactionTypes.Contains(reactionType))
        {
            return Error("Invalid reaction type.");
        }

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.UserId)
        {
            return PostNotFound();
        }

        var existing = await _dbContext.Reactions
            .FirstOrDefaultAsync(r =>
                r.UserId == parameters.UserId &&
                r.PostId == parameters.PostId);

        if (existing == null)
        {
            var reaction = new Reaction
            {
                Id = Guid.NewGuid(),
                UserId = parameters.UserId,
                PostId = parameters.PostId,
                ReactionType = reactionType,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Reactions.Add(reaction);
            post.ReactionCount += 1;

            await _dbContext.SaveChangesAsync();

            await _domainEventPublisher.PublishAsync(new ReactionUpsertedEvent
            {
                ReactionId = reaction.Id,
                PostId = post.Id,
                PostAuthorUserId = post.UserId,
                ActorUserId = parameters.UserId,
                ReactionType = reactionType,
                IsNewReaction = true,
                CreatedAt = reaction.CreatedAt
            });

            return Success(reaction);
        }

        existing.ReactionType = reactionType;

        await _dbContext.SaveChangesAsync();

        return Success(existing);
    }

    public async Task<ReactionResult> DeleteAsync(DeleteReactionParameters parameters)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        var reaction = await _dbContext.Reactions
            .FirstOrDefaultAsync(r =>
                r.UserId == parameters.UserId &&
                r.PostId == parameters.PostId);

        if (reaction == null)
        {
            return ReactionNotFound();
        }

        _dbContext.Reactions.Remove(reaction);
        post.ReactionCount = Math.Max(0, post.ReactionCount - 1);

        await _dbContext.SaveChangesAsync();

        return Success(reaction);
    }

    public async Task<ReactionDto?> GetMyByPostIdAsync(GetMyReactionParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
            return null;

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.UserId)
            return null;

        var reaction = await _dbContext.Reactions
            .AsNoTracking()
            .FirstOrDefaultAsync(r =>
                r.UserId == parameters.UserId &&
                r.PostId == parameters.PostId);

        return reaction == null ? null : MapToDto(reaction);
    }

    public async Task<IReadOnlyCollection<ReactionDto>> GetByPostIdAsync(GetReactionsByPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
            return Array.Empty<ReactionDto>();

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.ViewerUserId)
            return Array.Empty<ReactionDto>();

        var reactions = await _dbContext.Reactions
            .AsNoTracking()
            .Where(r => r.PostId == parameters.PostId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reactions.Select(MapToDto).ToList();
    }

    private static ReactionResult Success(Reaction reaction)
    {
        return new ReactionResult
        {
            Succeeded = true,
            Reaction = MapToDto(reaction)
        };
    }

    private static ReactionResult Error(string message)
    {
        return new ReactionResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static ReactionResult PostNotFound()
    {
        return new ReactionResult
        {
            Succeeded = false,
            Errors = new[] { "Post not found." }
        };
    }

    private static ReactionResult ReactionNotFound()
    {
        return new ReactionResult
        {
            Succeeded = false,
            Errors = new[] { "Reaction not found." }
        };
    }

    private static ReactionDto MapToDto(Reaction reaction)
    {
        return new ReactionDto
        {
            Id = reaction.Id,
            PostId = reaction.PostId,
            UserId = reaction.UserId,
            ReactionType = reaction.ReactionType,
            CreatedAt = reaction.CreatedAt
        };
    }
}
