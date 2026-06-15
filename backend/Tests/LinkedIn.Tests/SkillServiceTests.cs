using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Skill;
using Professional.DataAccess;
using Professional.Services.Services;

namespace LinkedIn.Tests;

public class SkillServiceTests : IDisposable
{
    private readonly ProfessionalDbContext _dbContext;
    private readonly SkillService _skillService;

    public SkillServiceTests()
    {
        var options = new DbContextOptionsBuilder<ProfessionalDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ProfessionalDbContext(options);
        _skillService = new SkillService(_dbContext);
    }

    [Fact]
    public async Task Create_ValidName_ReturnsSuccess()
    {
        var result = await _skillService.CreateAsync(new CreateSkillParameters
        {
            Name = "C#"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("C#", result.Skill!.Name);
        Assert.NotEqual(Guid.Empty, result.Skill.Id);
    }

    [Fact]
    public async Task Create_WithDescription_SetsDescription()
    {
        var result = await _skillService.CreateAsync(new CreateSkillParameters
        {
            Name = "ASP.NET Core",
            Description = "Web framework"
        });

        Assert.True(result.Succeeded);
        Assert.Equal("Web framework", result.Skill!.Description);
    }

    [Fact]
    public async Task Create_EmptyName_ReturnsError()
    {
        var result = await _skillService.CreateAsync(new CreateSkillParameters
        {
            Name = "   "
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Name is required.", result.Errors);
    }

    [Fact]
    public async Task GetById_ExistingSkill_ReturnsSkill()
    {
        var created = await _skillService.CreateAsync(new CreateSkillParameters { Name = "Docker" });

        var skill = await _skillService.GetByIdAsync(new GetSkillByIdParameters
        {
            SkillId = created.Skill!.Id
        });

        Assert.NotNull(skill);
        Assert.Equal("Docker", skill.Name);
    }

    [Fact]
    public async Task GetById_NonExisting_ReturnsNull()
    {
        var skill = await _skillService.GetByIdAsync(new GetSkillByIdParameters
        {
            SkillId = Guid.NewGuid()
        });

        Assert.Null(skill);
    }

    [Fact]
    public async Task Create_SetsCreatedAt()
    {
        var before = DateTime.UtcNow;

        var result = await _skillService.CreateAsync(new CreateSkillParameters { Name = "Git" });

        Assert.True(result.Skill!.CreatedAt >= before);
    }

    public void Dispose() => _dbContext.Dispose();
}
