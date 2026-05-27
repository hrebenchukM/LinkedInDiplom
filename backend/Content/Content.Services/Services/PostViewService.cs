using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostView;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис просмотров постов
public class PostViewService : IPostViewService
{
    private const string VisibilityPrivate = "private";
    private const int MaxPostViews = 100;

    private readonly ContentDbContext _dbContext;

    public PostViewService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PostViewResult> RecordAsync(RecordPostViewParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null || !CanViewPost(post, parameters.ViewerUserId))
        {
            return PostNotFound();
        }

        var viewerIp = string.IsNullOrWhiteSpace(parameters.ViewerIp)
            ? "unknown"
            : parameters.ViewerIp.Trim();

        var source = string.IsNullOrWhiteSpace(parameters.Source)
            ? null
            : parameters.Source.Trim();

        var postView = new PostView
        {
            Id = Guid.NewGuid(),
            PostId = parameters.PostId,
            ViewerUserId = parameters.ViewerUserId,
            ViewerIp = viewerIp,
            ViewerUserAgent = parameters.ViewerUserAgent,
            Source = source,
            ViewedAt = DateTime.UtcNow
        };

        _dbContext.PostViews.Add(postView);
        await _dbContext.SaveChangesAsync();

        return Success(postView);
    }

    public async Task<IReadOnlyCollection<PostViewDto>> GetByPostIdAsync(GetPostViewsParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null || post.UserId != parameters.AuthorId)
        {
            return Array.Empty<PostViewDto>();
        }

        var views = await _dbContext.PostViews
            .AsNoTracking()
            .Where(v => v.PostId == parameters.PostId)
            .OrderByDescending(v => v.ViewedAt)
            .Take(MaxPostViews)
            .ToListAsync();

        return views.Select(MapToDto).ToList();
    }

    private static bool CanViewPost(Post post, string viewerUserId)
    {
        if (post.Visibility == VisibilityPrivate && post.UserId != viewerUserId)
        {
            return false;
        }

        return true;
    }

    private static PostViewResult Success(PostView postView)
    {
        return new PostViewResult
        {
            Succeeded = true,
            PostView = MapToDto(postView)
        };
    }

    private static PostViewResult PostNotFound()
    {
        return new PostViewResult
        {
            Succeeded = false,
            Errors = new[] { "Post not found." }
        };
    }

    private static PostViewDto MapToDto(PostView postView)
    {
        return new PostViewDto
        {
            Id = postView.Id,
            PostId = postView.PostId,
            ViewerUserId = postView.ViewerUserId,
            ViewerIp = postView.ViewerIp,
            ViewerUserAgent = postView.ViewerUserAgent,
            Source = postView.Source,
            ViewedAt = postView.ViewedAt
        };
    }
}
