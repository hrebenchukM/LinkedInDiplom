using Identity.Contracts.Configuration;
using Identity.Contracts.Parameters;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Identity.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Moq;
using IdentityRole = Microsoft.AspNetCore.Identity.IdentityRole;

namespace LinkedIn.Tests;

public class AccountServiceTests : IDisposable
{
    private readonly IdentityDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserService _userService;
    private readonly AuthenticationService _authService;
    private readonly Mock<ITokenService> _tokenServiceMock;

    public AccountServiceTests()
    {
        var services = new ServiceCollection();

        services.AddDbContext<IdentityDbContext>(opts =>
            opts.UseInMemoryDatabase(Guid.NewGuid().ToString()));

        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 4;
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<IdentityDbContext>();

        var provider = services.BuildServiceProvider();

        _dbContext = provider.GetRequiredService<IdentityDbContext>();
        _userManager = provider.GetRequiredService<UserManager<ApplicationUser>>();
        _roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();

        _roleManager.CreateAsync(new IdentityRole("User")).GetAwaiter().GetResult();
        _roleManager.CreateAsync(new IdentityRole("Admin")).GetAwaiter().GetResult();

        _tokenServiceMock = new Mock<ITokenService>();
        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<IEnumerable<System.Security.Claims.Claim>>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken())
            .Returns(Guid.NewGuid().ToString);

        var eventPublisherMock = new Mock<IDomainEventPublisher>();

        var jwtSettings = Options.Create(new JwtSettings
        {
            AccessTokenExpirationMinutes = 15,
            RefreshTokenExpirationDays = 7
        });

        _userService = new UserService(_userManager, _roleManager, _dbContext, eventPublisherMock.Object);
        _authService = new AuthenticationService(_userManager, _tokenServiceMock.Object, _dbContext, jwtSettings);
    }

    [Fact]
    public async Task Register_ValidUser_ReturnsSuccess()
    {
        var result = await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = "testuser",
            Email = "test@example.com",
            Password = "pass1234"
        });

        Assert.True(result.Succeeded);
        Assert.NotNull(result.User);
        Assert.Equal("testuser", result.User.UserName);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsError()
    {
        await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = "user1", Email = "dup@example.com", Password = "pass1234"
        });

        var result = await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = "user2", Email = "dup@example.com", Password = "pass1234"
        });

        Assert.False(result.Succeeded);
        Assert.NotEmpty(result.Errors);
    }

    [Fact]
    public async Task GetAsync_ExistingUser_ReturnsUserDto()
    {
        var reg = await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = "getuser", Email = "get@example.com", Password = "pass1234"
        });

        var user = await _userService.GetAsync(new GetUserByIdParameters { UserId = reg.User!.Id });

        Assert.NotNull(user);
        Assert.Equal("getuser", user.UserName);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsSuccess()
    {
        await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = "loginuser", Email = "login@example.com", Password = "pass1234"
        });

        var result = await _authService.LoginAsync(new LoginParameters
        {
            Email = "login@example.com", Password = "pass1234"
        });

        Assert.True(result.Succeeded);
        Assert.NotNull(result.User);
        Assert.NotNull(result.Token);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsError()
    {
        await _userService.RegisterAsync(new RegisterUserParameters
        {
            UserName = "wrongpw", Email = "wrongpw@example.com", Password = "pass1234"
        });

        var result = await _authService.LoginAsync(new LoginParameters
        {
            Email = "wrongpw@example.com", Password = "badpassword"
        });

        Assert.False(result.Succeeded);
        Assert.Contains("Invalid email or password.", result.Errors);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _userManager.Dispose();
        _roleManager.Dispose();
    }
}
