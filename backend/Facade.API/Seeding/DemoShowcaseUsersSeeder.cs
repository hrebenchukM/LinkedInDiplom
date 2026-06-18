using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseUsersSeeder : IDemoSeeder
{
    public int Order => 2;

    public string Name => nameof(DemoShowcaseUsersSeeder);

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDomainEventPublisher _eventPublisher;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseUsersSeeder> _logger;

    public DemoShowcaseUsersSeeder(
        UserManager<ApplicationUser> userManager,
        IDomainEventPublisher eventPublisher,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseUsersSeeder> logger)
    {
        _userManager = userManager;
        _eventPublisher = eventPublisher;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase users seed started.");

        var created = 0;
        var primaryEmail = string.IsNullOrWhiteSpace(_options.PrimaryDemoUserEmail)
            ? DemoShowcaseSeedData.PrimaryDemoUserEmail
            : _options.PrimaryDemoUserEmail.Trim();
        var primaryPassword = string.IsNullOrWhiteSpace(_options.PrimaryDemoUserPassword)
            ? "Mgg101204"
            : _options.PrimaryDemoUserPassword;

        var primaryBefore = await _userManager.FindByEmailAsync(primaryEmail);
        var primaryUser = await DemoSeederSupport.EnsureDemoUserAsync(
            _userManager,
            _eventPublisher,
            _options,
            primaryEmail,
            _logger,
            cancellationToken,
            passwordOverride: primaryPassword);

        if (primaryUser is not null && primaryBefore is null)
        {
            created++;
        }

        foreach (var email in DemoShowcaseSeedData.AdditionalUserEmails)
        {
            if (string.Equals(email, primaryEmail, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var before = await _userManager.FindByEmailAsync(email);
            var user = await DemoSeederSupport.EnsureDemoUserAsync(
                _userManager,
                _eventPublisher,
                _options,
                email,
                _logger,
                cancellationToken);

            if (user is not null && before is null)
            {
                created++;
            }
        }

        _logger.LogInformation("Demo showcase users seed finished: {Created} user(s) created.", created);
    }
}
