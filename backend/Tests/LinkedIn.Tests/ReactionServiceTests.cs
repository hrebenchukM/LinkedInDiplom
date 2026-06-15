using Content.Contracts.Parameters.Post;
using Content.Contracts.Parameters.Reaction;
using Content.DataAccess;
using Content.Services.Services;
using Microsoft.EntityFrameworkCore;

namespace LinkedIn.Tests;

public class ReactionServiceTests : IDisposable
{
    private readonly ContentDbContext _dbContext;
    private readonly PostService _postService;
    private readonly ReactionService _reactionService;
    private readonly string _userId = Guid.NewGuid().ToString();

    public ReactionServiceTests()
    {
        var options = new DbContextOptionsBuilder<ContentDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ContentDbContext(options);
        _postService = new PostService(_dbContext);
        _reactionService = new ReactionService(_dbContext);
    }

    private async Task<Guid> CreatePublicPostAsync()
    {
        var result = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "Test post", Visibility = "public"
        });
        return result.Post!.Id;
    }

    [Fact]
    public async Task Upsert_ValidReaction_ReturnsSuccess()
    {
        var postId = await CreatePublicPostAsync();

        var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId,
            UserId = _userId,
            ReactionType = "like"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("like", result.Reaction!.ReactionType);
    }

    [Fact]
    public async Task Upsert_InvalidReactionType_ReturnsError()
    {
        var postId = await CreatePublicPostAsync();

        var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId,
            UserId = _userId,
            ReactionType = "angry"
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Invalid reaction type.", result.Errors);
    }

    [Fact]
    public async Task Upsert_AllowedTypes_AllSucceed()
    {
        var postId = await CreatePublicPostAsync();
        var types = new[] { "like", "celebrate", "support", "love", "insightful", "funny" };

        foreach (var type in types)
        {
            var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
            {
                PostId = postId, UserId = Guid.NewGuid().ToString(), ReactionType = type
            });
            Assert.True(result.Succeeded, $"Type '{type}' should be allowed");
        }
    }

    [Fact]
    public async Task Upsert_SameUserTwice_UpdatesReactionType()
    {
        var postId = await CreatePublicPostAsync();

        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = _userId, ReactionType = "like"
        });

        var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = _userId, ReactionType = "love"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("love", result.Reaction!.ReactionType);

        var post = await _dbContext.Posts.FindAsync(postId);
        Assert.Equal(1, post!.ReactionCount);
    }

    [Fact]
    public async Task Upsert_IncreasesReactionCount()
    {
        var postId = await CreatePublicPostAsync();

        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = Guid.NewGuid().ToString(), ReactionType = "like"
        });
        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = Guid.NewGuid().ToString(), ReactionType = "love"
        });

        var post = await _dbContext.Posts.FindAsync(postId);
        Assert.Equal(2, post!.ReactionCount);
    }

    [Fact]
    public async Task Upsert_OnPrivatePostByOtherUser_ReturnsError()
    {
        var privatePostResult = await _postService.CreateAsync(new CreatePostParameters
        {
            AuthorId = _userId, Content = "Private", Visibility = "private"
        });

        var result = await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = privatePostResult.Post!.Id,
            UserId = Guid.NewGuid().ToString(),
            ReactionType = "like"
        });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task Delete_ExistingReaction_ReturnsSuccess()
    {
        var postId = await CreatePublicPostAsync();

        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = _userId, ReactionType = "like"
        });

        var deleteResult = await _reactionService.DeleteAsync(new DeleteReactionParameters
        {
            PostId = postId, UserId = _userId
        });

        Assert.True(deleteResult.Succeeded);

        var post = await _dbContext.Posts.FindAsync(postId);
        Assert.Equal(0, post!.ReactionCount);
    }

    [Fact]
    public async Task Delete_NonExistingReaction_ReturnsError()
    {
        var postId = await CreatePublicPostAsync();

        var result = await _reactionService.DeleteAsync(new DeleteReactionParameters
        {
            PostId = postId, UserId = _userId
        });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task GetMyByPostId_ReturnsCorrectReaction()
    {
        var postId = await CreatePublicPostAsync();

        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = _userId, ReactionType = "celebrate"
        });

        var reaction = await _reactionService.GetMyByPostIdAsync(new GetMyReactionParameters
        {
            PostId = postId, UserId = _userId
        });

        Assert.NotNull(reaction);
        Assert.Equal("celebrate", reaction.ReactionType);
    }

    [Fact]
    public async Task GetByPostId_ReturnsAllReactions()
    {
        var postId = await CreatePublicPostAsync();

        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = Guid.NewGuid().ToString(), ReactionType = "like"
        });
        await _reactionService.UpsertAsync(new UpsertReactionParameters
        {
            PostId = postId, UserId = Guid.NewGuid().ToString(), ReactionType = "love"
        });

        var reactions = await _reactionService.GetByPostIdAsync(new GetReactionsByPostParameters
        {
            PostId = postId, ViewerUserId = _userId
        });

        Assert.Equal(2, reactions.Count);
    }

    public void Dispose() => _dbContext.Dispose();
}
