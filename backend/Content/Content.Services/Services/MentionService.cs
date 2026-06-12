using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Mention;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис упоминаний в постах
public class MentionService : IMentionService
{
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;

    public MentionService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MentionResult> AddAsync(AddMentionParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        if (parameters.MentionedUserId == parameters.AuthorId)
        {
            return Error("Cannot mention yourself.");
        }

        var existing = await _dbContext.Mentions
            .FirstOrDefaultAsync(m =>
                m.PostId == parameters.PostId &&
                m.MentionedUserId == parameters.MentionedUserId);

        if (existing != null)
        {
            if (existing.DeletedAt == null)
            {
                return Error("Mention already exists.");
            }

            existing.DeletedAt = null;
            existing.CreatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Success(existing);
        }

        var mention = new Mention
        {
            Id = Guid.NewGuid(),
            PostId = parameters.PostId,
            MentionedUserId = parameters.MentionedUserId,
            CreatedAt = DateTime.UtcNow,
            DeletedAt = null
        };

        _dbContext.Mentions.Add(mention);
        await _dbContext.SaveChangesAsync();

        return Success(mention);
    }

    public async Task<MentionResult> RemoveAsync(RemoveMentionParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        var mention = await _dbContext.Mentions
            .FirstOrDefaultAsync(m =>
                m.PostId == parameters.PostId &&
                m.MentionedUserId == parameters.MentionedUserId &&
                m.DeletedAt == null);

        if (mention == null)
        {
            return MentionNotFound();
        }

        mention.DeletedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Success(mention);
    }

    public async Task<IReadOnlyCollection<MentionDto>> GetByPostIdAsync(GetMentionsByPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return Array.Empty<MentionDto>();
        }

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.ViewerUserId)
        {
            return Array.Empty<MentionDto>();
        }

        var mentions = await _dbContext.Mentions
            .AsNoTracking()
            .Where(m =>
                m.PostId == parameters.PostId &&
                m.DeletedAt == null)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return mentions.Select(MapToDto).ToList();
    }

    private static MentionResult Success(Mention mention)
    {
        return new MentionResult
        {
            Succeeded = true,
            Mention = MapToDto(mention)
        };
    }

    private static MentionResult Error(string message)
    {
        return new MentionResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static MentionResult PostNotFound()
    {
        return Error("Post not found.");
    }

    private static MentionResult MentionNotFound()
    {
        return Error("Mention not found.");
    }

    private static MentionDto MapToDto(Mention mention)
    {
        return new MentionDto
        {
            Id = mention.Id,
            PostId = mention.PostId,
            MentionedUserId = mention.MentionedUserId,
            CreatedAt = mention.CreatedAt
        };
    }
}
