using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Experience;
using Professional.DataAccess;
using Professional.Services.Services;

namespace LinkedIn.Tests;

public class ExperienceServiceTests : IDisposable
{
    private readonly ProfessionalDbContext _dbContext;
    private readonly ExperienceService _experienceService;
    private readonly string _userId = Guid.NewGuid().ToString();

    public ExperienceServiceTests()
    {
        var options = new DbContextOptionsBuilder<ProfessionalDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ProfessionalDbContext(options);
        _experienceService = new ExperienceService(_dbContext);
    }

    [Fact]
    public async Task Create_ValidExperience_ReturnsSuccess()
    {
        var result = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId,
            Position = "Software Engineer",
            StartDate = new DateOnly(2022, 1, 1)
        });

        Assert.True(result.Succeeded);
        Assert.Equal("Software Engineer", result.Experience!.Position);
        Assert.Equal(_userId, result.Experience.UserId);
    }

    [Fact]
    public async Task Create_EmptyPosition_ReturnsError()
    {
        var result = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId,
            Position = "   ",
            StartDate = new DateOnly(2022, 1, 1)
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Position is required.", result.Errors);
    }

    [Fact]
    public async Task Create_EndDateBeforeStartDate_ReturnsError()
    {
        var result = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId,
            Position = "Developer",
            StartDate = new DateOnly(2023, 6, 1),
            EndDate = new DateOnly(2022, 1, 1)
        });

        Assert.False(result.Succeeded);
        Assert.Contains("End date cannot be earlier than start date.", result.Errors);
    }

    [Fact]
    public async Task Create_WithEndDate_ReturnsSuccess()
    {
        var result = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId,
            Position = "Junior Developer",
            StartDate = new DateOnly(2020, 1, 1),
            EndDate = new DateOnly(2022, 12, 31)
        });

        Assert.True(result.Succeeded);
        Assert.Equal(new DateOnly(2022, 12, 31), result.Experience!.EndDate);
    }

    [Fact]
    public async Task GetUserExperiences_ReturnsOnlyUserExperiences()
    {
        var otherUserId = Guid.NewGuid().ToString();

        await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId, Position = "Dev", StartDate = new DateOnly(2022, 1, 1)
        });
        await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = otherUserId, Position = "Manager", StartDate = new DateOnly(2021, 1, 1)
        });

        var experiences = await _experienceService.GetUserExperiencesAsync(
            new GetUserExperiencesParameters { UserId = _userId });

        Assert.Single(experiences);
        Assert.Equal("Dev", experiences.First().Position);
    }

    [Fact]
    public async Task GetById_ExistingExperience_ReturnsExperience()
    {
        var created = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId, Position = "QA Engineer", StartDate = new DateOnly(2021, 3, 1)
        });

        var experience = await _experienceService.GetByIdAsync(new GetExperienceByIdParameters
        {
            ExperienceId = created.Experience!.Id, UserId = _userId
        });

        Assert.NotNull(experience);
        Assert.Equal("QA Engineer", experience.Position);
    }

    [Fact]
    public async Task GetById_OtherUsersExperience_ReturnsNull()
    {
        var created = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId, Position = "Dev", StartDate = new DateOnly(2022, 1, 1)
        });

        var experience = await _experienceService.GetByIdAsync(new GetExperienceByIdParameters
        {
            ExperienceId = created.Experience!.Id,
            UserId = Guid.NewGuid().ToString()
        });

        Assert.Null(experience);
    }

    [Fact]
    public async Task Update_ValidData_ReturnsSuccess()
    {
        var created = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId, Position = "Junior Dev", StartDate = new DateOnly(2020, 1, 1)
        });

        var updateResult = await _experienceService.UpdateAsync(new UpdateExperienceParameters
        {
            ExperienceId = created.Experience!.Id,
            UserId = _userId,
            Position = "Senior Dev",
            StartDate = new DateOnly(2020, 1, 1)
        });

        Assert.True(updateResult.Succeeded);
        Assert.Equal("Senior Dev", updateResult.Experience!.Position);
        Assert.NotNull(updateResult.Experience.UpdatedAt);
    }

    [Fact]
    public async Task Update_NonExistingExperience_ReturnsError()
    {
        var result = await _experienceService.UpdateAsync(new UpdateExperienceParameters
        {
            ExperienceId = Guid.NewGuid(),
            UserId = _userId,
            Position = "Dev",
            StartDate = new DateOnly(2022, 1, 1)
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Experience not found.", result.Errors);
    }

    [Fact]
    public async Task Delete_SoftDeletes()
    {
        var created = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId, Position = "Dev", StartDate = new DateOnly(2022, 1, 1)
        });

        var deleteResult = await _experienceService.DeleteAsync(new DeleteExperienceParameters
        {
            ExperienceId = created.Experience!.Id, UserId = _userId
        });

        Assert.True(deleteResult.Succeeded);

        var experiences = await _experienceService.GetUserExperiencesAsync(
            new GetUserExperiencesParameters { UserId = _userId });

        Assert.Empty(experiences);
    }

    [Fact]
    public async Task Delete_OtherUsersExperience_ReturnsError()
    {
        var created = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId, Position = "Dev", StartDate = new DateOnly(2022, 1, 1)
        });

        var result = await _experienceService.DeleteAsync(new DeleteExperienceParameters
        {
            ExperienceId = created.Experience!.Id,
            UserId = Guid.NewGuid().ToString()
        });

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task Patch_PartialUpdate_PreservesOtherFields()
    {
        var created = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = _userId,
            Position = "Developer",
            Location = "Kyiv",
            StartDate = new DateOnly(2020, 1, 1)
        });

        var patchResult = await _experienceService.PatchAsync(new PatchExperienceParameters
        {
            ExperienceId = created.Experience!.Id,
            UserId = _userId,
            Position = "Senior Developer"
        });

        Assert.True(patchResult.Succeeded);
        Assert.Equal("Senior Developer", patchResult.Experience!.Position);
        Assert.Equal("Kyiv", patchResult.Experience.Location);
    }

    public void Dispose() => _dbContext.Dispose();
}
