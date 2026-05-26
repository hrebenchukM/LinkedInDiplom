using Content.Contracts.Parameters.Hashtag;
using Content.DataAccess;
using Content.Services.Services;
using Microsoft.EntityFrameworkCore;

namespace LinkedIn.Tests;

public class HashtagServiceTests : IDisposable
{
    private readonly ContentDbContext _dbContext;
    private readonly HashtagService _hashtagService;

    public HashtagServiceTests()
    {
        var options = new DbContextOptionsBuilder<ContentDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ContentDbContext(options);
        _hashtagService = new HashtagService(_dbContext);
    }

    [Fact]
    public async Task CreateHashtag_WithValidName_ReturnsSuccess()
    {
        var result = await _hashtagService.CreateAsync(new CreateHashtagParameters
        {
            Name = "dotnet"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("dotnet", result.Hashtag!.Name);
    }

    [Fact]
    public async Task CreateHashtag_NormalizesToLowercase()
    {
        var result = await _hashtagService.CreateAsync(new CreateHashtagParameters
        {
            Name = "  DotNet  "
        });

        Assert.True(result.Succeeded);
        Assert.Equal("dotnet", result.Hashtag!.Name);
    }

    [Fact]
    public async Task CreateHashtag_EmptyName_ReturnsError()
    {
        var result = await _hashtagService.CreateAsync(new CreateHashtagParameters
        {
            Name = "   "
        });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task CreateHashtag_Duplicate_ReturnsError()
    {
        await _hashtagService.CreateAsync(new CreateHashtagParameters { Name = "csharp" });
        var result = await _hashtagService.CreateAsync(new CreateHashtagParameters { Name = "csharp" });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task GetById_ExistingHashtag_ReturnsHashtag()
    {
        var created = await _hashtagService.CreateAsync(new CreateHashtagParameters { Name = "test" });

        var hashtag = await _hashtagService.GetByIdAsync(new GetHashtagByIdParameters
        {
            HashtagId = created.Hashtag!.Id
        });

        Assert.NotNull(hashtag);
        Assert.Equal("test", hashtag.Name);
    }

    [Fact]
    public async Task GetById_NonExisting_ReturnsNull()
    {
        var hashtag = await _hashtagService.GetByIdAsync(new GetHashtagByIdParameters
        {
            HashtagId = Guid.NewGuid()
        });

        Assert.Null(hashtag);
    }

    [Fact]
    public async Task GetByName_ExistingHashtag_ReturnsHashtag()
    {
        await _hashtagService.CreateAsync(new CreateHashtagParameters { Name = "linkedin" });

        var hashtag = await _hashtagService.GetByNameAsync(new GetHashtagByNameParameters
        {
            Name = "LinkedIn"
        });

        Assert.NotNull(hashtag);
        Assert.Equal("linkedin", hashtag.Name);
    }

    [Fact]
    public async Task GetByName_NonExisting_ReturnsNull()
    {
        var hashtag = await _hashtagService.GetByNameAsync(new GetHashtagByNameParameters
        {
            Name = "nonexistent"
        });

        Assert.Null(hashtag);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
