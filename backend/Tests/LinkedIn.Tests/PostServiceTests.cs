using Content.Contracts.Parameters.Post;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Content.Services.Services;
using Microsoft.EntityFrameworkCore;

namespace LinkedIn.Tests;

public class PostServiceTests : IDisposable
{
    private readonly ContentDbContext _dbContext;
    private readonly PostService _postService;
    private readonly string _userId = Guid.NewGuid().ToString();

    public PostServiceTests()
    {
        var options = new DbContextOptionsBuilder<ContentDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ContentDbContext(options);
        _postService = new PostService(_dbContext);
    }

    [Fact]
    public async Task CreatePost_WithValidContent_ReturnsSuccess()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId,
            Content = "Hello world!",
            Visibility = "public"
        });

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Post);
        Assert.Equal("Hello world!", result.Post.Content);
        Assert.Equal("public", result.Post.Visibility);
    }

    [Fact]
    public async Task CreatePost_WithEmptyContent_ReturnsError()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId,
            Content = "   ",
            Visibility = "public"
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Post content is required.", result.Errors);
    }

    [Fact]
    public async Task CreatePost_WithInvalidVisibility_ReturnsError()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId,
            Content = "Test post",
            Visibility = "invalid"
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Invalid visibility.", result.Errors);
    }

    [Fact]
    public async Task CreatePost_WithPrivateVisibility_ReturnsSuccess()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId,
            Content = "Private post",
            Visibility = "private"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("private", result.Post!.Visibility);
    }

    [Fact]
    public async Task GetMyPosts_ReturnsOnlyUserPosts()
    {
        var otherUserId = Guid.NewGuid().ToString();

        await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "My post", Visibility = "public"
        });
        await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = otherUserId, Content = "Other post", Visibility = "public"
        });

        var posts = await _postService.GetMyPostsAsync(new GetMyPostsParameters
        {
            AuthorId = _userId
        });

        Assert.Single(posts);
        Assert.Equal("My post", posts.First().Content);
    }

    [Fact]
    public async Task GetMyPosts_ExcludesDeletedPosts()
    {
        var createResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "Will be deleted", Visibility = "public"
        });

        await _postService.DeleteAsync(new DeletePostParameters
        {
            PostId = createResult.Post!.Id, AuthorId = _userId
        });

        var posts = await _postService.GetMyPostsAsync(new GetMyPostsParameters
        {
            AuthorId = _userId
        });

        Assert.Empty(posts);
    }

    [Fact]
    public async Task GetById_PrivatePost_HiddenFromOtherUsers()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "Secret", Visibility = "private"
        });

        var otherUserId = Guid.NewGuid().ToString();
        var post = await _postService.GetByIdAsync(new GetPostByIdParameters
        {
            PostId = result.Post!.Id, ViewerUserId = otherUserId
        });

        Assert.Null(post);
    }

    [Fact]
    public async Task GetById_PrivatePost_VisibleToAuthor()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "Secret", Visibility = "private"
        });

        var post = await _postService.GetByIdAsync(new GetPostByIdParameters
        {
            PostId = result.Post!.Id, ViewerUserId = _userId
        });

        Assert.NotNull(post);
        Assert.Equal("Secret", post.Content);
    }

    [Fact]
    public async Task UpdatePost_ChangesContentAndVisibility()
    {
        var createResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "Original", Visibility = "public"
        });

        var updateResult = await _postService.UpdateAsync(new UpdatePostParameters
        {
            PostId = createResult.Post!.Id,
            AuthorId = _userId,
            Content = "Updated",
            Visibility = "private"
        });

        Assert.True(updateResult.Succeeded);
        Assert.Equal("Updated", updateResult.Post!.Content);
        Assert.Equal("private", updateResult.Post.Visibility);
        Assert.NotNull(updateResult.Post.EditedAt);
    }

    [Fact]
    public async Task UpdatePost_OtherUser_ReturnsNotFound()
    {
        var createResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "My post", Visibility = "public"
        });

        var updateResult = await _postService.UpdateAsync(new UpdatePostParameters
        {
            PostId = createResult.Post!.Id,
            AuthorId = Guid.NewGuid().ToString(),
            Content = "Hacked",
            Visibility = "public"
        });

        Assert.False(updateResult.Succeeded);
    }

    [Fact]
    public async Task DeletePost_SoftDeletes()
    {
        var createResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "To delete", Visibility = "public"
        });

        var deleteResult = await _postService.DeleteAsync(new DeletePostParameters
        {
            PostId = createResult.Post!.Id, AuthorId = _userId
        });

        Assert.True(deleteResult.Succeeded);

        var postInDb = await _dbContext.Posts.FindAsync(createResult.Post.Id);
        Assert.NotNull(postInDb!.DeletedAt);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
