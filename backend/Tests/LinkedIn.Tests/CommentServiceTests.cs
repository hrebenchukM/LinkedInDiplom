using Content.Contracts.Parameters.Comment;
using Content.Contracts.Parameters.Post;
using Content.DataAccess;
using Content.Services.Services;
using Microsoft.EntityFrameworkCore;

namespace LinkedIn.Tests;

public class CommentServiceTests : IDisposable
{
    private readonly ContentDbContext _dbContext;
    private readonly PostService _postService;
    private readonly CommentService _commentService;
    private readonly string _userId = Guid.NewGuid().ToString();

    public CommentServiceTests()
    {
        var options = new DbContextOptionsBuilder<ContentDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ContentDbContext(options);
        _postService = new PostService(_dbContext);
        _commentService = new CommentService(_dbContext, new NoOpDomainEventPublisher());
    }

    private async Task<Guid> CreatePublicPostAsync()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId,
            Content = "Test post",
            Visibility = "public"
        });
        return result.Post!.Id;
    }

    [Fact]
    public async Task CreateComment_ValidContent_ReturnsSuccess()
    {
        var postId = await CreatePublicPostAsync();

        var result = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId,
            AuthorId = _userId,
            Content = "Great post!"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("Great post!", result.Comment!.Content);
        Assert.Equal(postId, result.Comment.PostId);
    }

    [Fact]
    public async Task CreateComment_EmptyContent_ReturnsError()
    {
        var postId = await CreatePublicPostAsync();

        var result = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId,
            AuthorId = _userId,
            Content = "   "
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Comment content is required.", result.Errors);
    }

    [Fact]
    public async Task CreateComment_NonExistentPost_ReturnsError()
    {
        var result = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = Guid.NewGuid(),
            AuthorId = _userId,
            Content = "Hello"
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Post not found.", result.Errors);
    }

    [Fact]
    public async Task CreateComment_OnPrivatePostByOtherUser_ReturnsError()
    {
        var privatePostResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId,
            Content = "Private",
            Visibility = "private"
        });

        var otherUserId = Guid.NewGuid().ToString();
        var result = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = privatePostResult.Post!.Id,
            AuthorId = otherUserId,
            Content = "Sneaky comment"
        });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task CreateComment_IncreasesCommentCount()
    {
        var postId = await CreatePublicPostAsync();

        await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "First"
        });
        await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "Second"
        });

        var post = await _dbContext.Posts.FindAsync(postId);
        Assert.Equal(2, post!.CommentCount);
    }

    [Fact]
    public async Task CreateReply_ValidParentComment_ReturnsSuccess()
    {
        var postId = await CreatePublicPostAsync();

        var parentResult = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "Parent"
        });

        var replyResult = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId,
            AuthorId = _userId,
            Content = "Reply",
            ParentCommentId = parentResult.Comment!.Id
        });

        Assert.True(replyResult.Succeeded);
        Assert.Equal(parentResult.Comment.Id, replyResult.Comment!.ParentCommentId);
    }

    [Fact]
    public async Task GetByPostId_ReturnsAllComments()
    {
        var postId = await CreatePublicPostAsync();

        await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "One"
        });
        await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "Two"
        });

        var comments = await _commentService.GetByPostIdAsync(new GetCommentsByPostParameters
        {
            PostId = postId, ViewerUserId = _userId, Take = 100
        });

        Assert.Equal(2, comments.Items.Count);
        Assert.Equal(2, comments.TotalCount);
    }

    [Fact]
    public async Task UpdateComment_ByAuthor_ReturnsSuccess()
    {
        var postId = await CreatePublicPostAsync();
        var createResult = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "Original"
        });

        var updateResult = await _commentService.UpdateAsync(new UpdateCommentParameters
        {
            CommentId = createResult.Comment!.Id,
            AuthorId = _userId,
            Content = "Updated"
        });

        Assert.True(updateResult.Succeeded);
        Assert.Equal("Updated", updateResult.Comment!.Content);
        Assert.NotNull(updateResult.Comment.UpdatedAt);
    }

    [Fact]
    public async Task UpdateComment_ByOtherUser_ReturnsError()
    {
        var postId = await CreatePublicPostAsync();
        var createResult = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "Mine"
        });

        var updateResult = await _commentService.UpdateAsync(new UpdateCommentParameters
        {
            CommentId = createResult.Comment!.Id,
            AuthorId = Guid.NewGuid().ToString(),
            Content = "Hacked"
        });

        Assert.False(updateResult.Succeeded);
    }

    [Fact]
    public async Task DeleteComment_SoftDeletes_DecreasesCommentCount()
    {
        var postId = await CreatePublicPostAsync();
        var createResult = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "To delete"
        });

        var deleteResult = await _commentService.DeleteAsync(new DeleteCommentParameters
        {
            CommentId = createResult.Comment!.Id,
            AuthorId = _userId
        });

        Assert.True(deleteResult.Succeeded);

        var comment = await _dbContext.Comments.FindAsync(createResult.Comment.Id);
        Assert.NotNull(comment!.DeletedAt);

        var post = await _dbContext.Posts.FindAsync(postId);
        Assert.Equal(0, post!.CommentCount);
    }

    [Fact]
    public async Task DeleteComment_ByOtherUser_ReturnsError()
    {
        var postId = await CreatePublicPostAsync();
        var createResult = await _commentService.CreateAsync(new CreateCommentParameters
        {
            PostId = postId, AuthorId = _userId, Content = "Mine"
        });

        var deleteResult = await _commentService.DeleteAsync(new DeleteCommentParameters
        {
            CommentId = createResult.Comment!.Id,
            AuthorId = Guid.NewGuid().ToString()
        });

        Assert.False(deleteResult.Succeeded);
    }

    public void Dispose() => _dbContext.Dispose();
}
