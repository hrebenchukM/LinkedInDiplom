using Microsoft.EntityFrameworkCore;
using Network.Contracts.Parameters.Follow;
using Network.DataAccess;
using Network.DataAccess.Entities;
using Network.Services.Services;

namespace LinkedIn.Tests;

public class FollowServiceTests : IDisposable
{
    private readonly NetworkDbContext _dbContext;
    private readonly FollowService _followService;
    private readonly string _userId = Guid.NewGuid().ToString();
    private readonly string _otherUserId = Guid.NewGuid().ToString();

    public FollowServiceTests()
    {
        var options = new DbContextOptionsBuilder<NetworkDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new NetworkDbContext(options);
        _followService = new FollowService(_dbContext);
    }

    [Fact]
    public async Task Follow_ValidUsers_ReturnsSuccess()
    {
        var result = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId,
            FollowingId = _otherUserId
        });

        Assert.True(result.Succeeded);
        Assert.Equal(_userId, result.Follow!.FollowerId);
        Assert.Equal(_otherUserId, result.Follow.FollowingId);
        Assert.Null(result.Follow.UnfollowedAt);
    }

    [Fact]
    public async Task Follow_Self_ReturnsError()
    {
        var result = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId,
            FollowingId = _userId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("You cannot follow yourself.", result.Errors);
    }

    [Fact]
    public async Task Follow_AlreadyFollowing_ReturnsError()
    {
        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        var result = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Already following this user.", result.Errors);
    }

    [Fact]
    public async Task Follow_AfterUnfollow_ReturnsSuccess()
    {
        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        await _followService.UnfollowAsync(new UnfollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        var result = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        Assert.True(result.Succeeded);
        Assert.Null(result.Follow!.UnfollowedAt);
    }

    [Fact]
    public async Task Follow_WhenBlockedByTarget_ReturnsError()
    {
        _dbContext.BlockedUsers.Add(new BlockedUser
        {
            Id = Guid.NewGuid(),
            UserId = _otherUserId,
            BlockedUserId = _userId,
            BlockedAt = DateTime.UtcNow,
            UnblockedAt = null
        });
        await _dbContext.SaveChangesAsync();

        var result = await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId,
            FollowingId = _otherUserId
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Cannot follow while a block exists.", result.Errors);
    }

    [Fact]
    public async Task Unfollow_Existing_ReturnsSuccess()
    {
        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        var result = await _followService.UnfollowAsync(new UnfollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Follow!.UnfollowedAt);
    }

    [Fact]
    public async Task Unfollow_NotFollowing_ReturnsError()
    {
        var result = await _followService.UnfollowAsync(new UnfollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task GetMyFollowing_ReturnsOnlyActiveFollows()
    {
        var thirdUserId = Guid.NewGuid().ToString();

        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = _otherUserId
        });
        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _userId, FollowingId = thirdUserId
        });
        await _followService.UnfollowAsync(new UnfollowUserParameters
        {
            FollowerId = _userId, FollowingId = thirdUserId
        });

        var following = await _followService.GetMyFollowingAsync(new GetMyFollowingParameters
        {
            UserId = _userId
        });

        Assert.Single(following);
        Assert.Equal(_otherUserId, following.First().FollowingId);
    }

    [Fact]
    public async Task GetMyFollowers_ReturnsCorrectList()
    {
        await _followService.FollowAsync(new FollowUserParameters
        {
            FollowerId = _otherUserId, FollowingId = _userId
        });

        var followers = await _followService.GetMyFollowersAsync(new GetMyFollowersParameters
        {
            UserId = _userId
        });

        Assert.Single(followers);
        Assert.Equal(_otherUserId, followers.First().FollowerId);
    }

    public void Dispose() => _dbContext.Dispose();
}
