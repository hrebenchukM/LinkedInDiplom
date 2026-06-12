using Microsoft.EntityFrameworkCore;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Profile.DataAccess;
using Profile.Services.Services;

namespace LinkedIn.Tests;

/// <summary>
/// Тесты core-сервиса профиля.
/// Покрывают создание пустого профиля, обновление и поведение при soft delete.
/// </summary>
public class ProfileServiceTests : IDisposable
{
    private readonly ProfileDbContext _dbContext;
    private readonly ProfileService _profileService;
    private readonly string _userId = Guid.NewGuid().ToString();

    public ProfileServiceTests()
    {
        var options = new DbContextOptionsBuilder<ProfileDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ProfileDbContext(options);
        _profileService = new ProfileService(_dbContext);
    }

    [Fact]
    public async Task CreateEmpty_CreatesProfileWithDefaults()
    {
        var profile = await _profileService.CreateEmptyAsync(_userId);

        Assert.NotNull(profile);
        Assert.Equal(_userId, profile.UserId);
        Assert.Null(profile.FirstName);
        Assert.Null(profile.LastName);
        Assert.NotEqual(Guid.Empty, profile.Id);
    }

    [Fact]
    public async Task CreateEmpty_CalledTwice_ReturnsSameProfile()
    {
        var first = await _profileService.CreateEmptyAsync(_userId);
        var second = await _profileService.CreateEmptyAsync(_userId);

        Assert.Equal(first.Id, second.Id);
    }

    [Fact]
    public async Task GetProfile_ExistingUser_ReturnsProfile()
    {
        await _profileService.CreateEmptyAsync(_userId);

        var profile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = _userId
        });

        Assert.NotNull(profile);
        Assert.Equal(_userId, profile.UserId);
    }

    [Fact]
    public async Task GetProfile_NonExistingUser_ReturnsNull()
    {
        var profile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = "non-existing-id"
        });

        Assert.Null(profile);
    }

    [Fact]
    public async Task UpdateProfile_SetsAllFields()
    {
        await _profileService.CreateEmptyAsync(_userId);

        var updated = await _profileService.UpdateAsync(new UserProfileDto
        {
            UserId = _userId,
            FirstName = "Валерия",
            LastName = "Прохорова",
            Headline = ".NET Developer",
            Location = "Одесса",
            University = "ОПУ"
        });

        Assert.Equal("Валерия", updated.FirstName);
        Assert.Equal("Прохорова", updated.LastName);
        Assert.Equal("Валерия Прохорова", updated.FullName?.Trim() ?? "");
        Assert.Equal(".NET Developer", updated.Headline);
        Assert.Equal("Одесса", updated.Location);
        Assert.NotNull(updated.UpdatedAt);
    }

    [Fact]
    public async Task UpdateProfile_WithoutExistingProfile_CreatesNew()
    {
        var newUserId = Guid.NewGuid().ToString();

        var result = await _profileService.UpdateAsync(new UserProfileDto
        {
            UserId = newUserId,
            FirstName = "New",
            LastName = "User"
        });

        Assert.Equal(newUserId, result.UserId);
        Assert.Equal("New", result.FirstName);
    }

    [Fact]
    public async Task GetProfile_SoftDeleted_ReturnsNull()
    {
        await _profileService.CreateEmptyAsync(_userId);

        var entity = await _dbContext.UserProfiles.FirstAsync(p => p.UserId == _userId);
        entity.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        var profile = await _profileService.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = _userId
        });

        Assert.Null(profile);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
