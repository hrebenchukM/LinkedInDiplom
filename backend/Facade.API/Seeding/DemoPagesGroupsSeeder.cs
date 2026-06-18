using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Services;
using Network.DataAccess;

namespace Facade.API.Seeding;

public sealed class DemoPagesGroupsSeeder : IDemoSeeder
{
    public int Order => 22;

    public string Name => nameof(DemoPagesGroupsSeeder);

    private const string PrimaryDemoUserEmail = DemoSeedConstants.PrimaryDemoUserEmail;

    private readonly NetworkDbContext _networkDb;
    private readonly IPageService _pageService;
    private readonly IUserGroupService _userGroupService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoPagesGroupsSeeder> _logger;

    public DemoPagesGroupsSeeder(
        NetworkDbContext networkDb,
        IPageService pageService,
        IUserGroupService userGroupService,
        DemoSeedUserLookup userLookup,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoPagesGroupsSeeder> logger)
    {
        _networkDb = networkDb;
        _pageService = pageService;
        _userGroupService = userGroupService;
        _userLookup = userLookup;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo pages/groups seed started.");

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var owner = _userLookup.TryGet(users, PrimaryDemoUserEmail);
        if (owner is null)
        {
            _logger.LogWarning(
                "Demo pages/groups seed skipped: primary demo user {Email} was not found.",
                PrimaryDemoUserEmail);
            return;
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var pageName = $"{marker} LinkUp Labs";
        var groupName = $"{marker} React & .NET Developers";

        await EnsureDemoPageAsync(owner, pageName, marker, cancellationToken);
        await EnsureDemoGroupAsync(owner, groupName, marker, cancellationToken);

        _logger.LogInformation("Demo pages/groups seed completed.");
    }

    private async Task EnsureDemoPageAsync(
        ApplicationUser owner,
        string pageName,
        string marker,
        CancellationToken cancellationToken)
    {
        var exists = await _networkDb.Pages
            .AsNoTracking()
            .AnyAsync(
                p =>
                    p.DeletedAt == null &&
                    p.OwnerId == owner.Id &&
                    p.Name == pageName,
                cancellationToken);

        if (exists)
        {
            _logger.LogInformation(
                "Demo pages/groups seed: page {PageName} already exists; skipped.",
                pageName);
            return;
        }

        var result = await _pageService.CreateAsync(new CreatePageParameters
        {
            OwnerId = owner.Id,
            Name = pageName,
            Description = $"{marker} Demo company page for diploma project.",
        });

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors);
            _logger.LogError("Demo pages/groups seed: failed to create page {PageName}: {Errors}", pageName, errors);
            return;
        }

        _logger.LogInformation("Demo pages/groups seed: created page {PageName}.", pageName);
    }

    private async Task EnsureDemoGroupAsync(
        ApplicationUser owner,
        string groupName,
        string marker,
        CancellationToken cancellationToken)
    {
        var exists = await _networkDb.UserGroups
            .AsNoTracking()
            .AnyAsync(
                g =>
                    g.DeletedAt == null &&
                    g.OwnerId == owner.Id &&
                    g.Name == groupName,
                cancellationToken);

        if (exists)
        {
            _logger.LogInformation(
                "Demo pages/groups seed: group {GroupName} already exists; skipped.",
                groupName);
            return;
        }

        var result = await _userGroupService.CreateAsync(new CreateUserGroupParameters
        {
            OwnerId = owner.Id,
            Name = groupName,
            Description = $"{marker} Demo group for local development.",
        });

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors);
            _logger.LogError("Demo pages/groups seed: failed to create group {GroupName}: {Errors}", groupName, errors);
            return;
        }

        _logger.LogInformation("Demo pages/groups seed: created group {GroupName}.", groupName);
    }
}
