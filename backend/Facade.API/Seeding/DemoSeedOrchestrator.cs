using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoSeedOrchestrator : IDemoSeedOrchestrator
{
    private readonly DemoSeedOptions _options;
    private readonly DemoUsersSeeder _usersSeeder;
    private readonly DemoProfileSeeder _profileSeeder;
    private readonly DemoContentSeeder _contentSeeder;
    private readonly DemoJobsSeeder _jobsSeeder;
    private readonly DemoEventsSeeder _eventsSeeder;
    private readonly DemoNetworkSeeder _networkSeeder;
    private readonly DemoMessagingSeeder _messagingSeeder;
    private readonly DemoContentEngagementSeeder _contentEngagementSeeder;
    private readonly DemoPagesGroupsSeeder _pagesGroupsSeeder;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoSeedOrchestrator> _logger;

    public DemoSeedOrchestrator(
        IOptions<DemoSeedOptions> options,
        DemoUsersSeeder usersSeeder,
        DemoProfileSeeder profileSeeder,
        DemoContentSeeder contentSeeder,
        DemoJobsSeeder jobsSeeder,
        DemoEventsSeeder eventsSeeder,
        DemoNetworkSeeder networkSeeder,
        DemoMessagingSeeder messagingSeeder,
        DemoContentEngagementSeeder contentEngagementSeeder,
        DemoPagesGroupsSeeder pagesGroupsSeeder,
        DemoSeedUserLookup userLookup,
        ILogger<DemoSeedOrchestrator> logger)
    {
        _options = options.Value;
        _usersSeeder = usersSeeder;
        _profileSeeder = profileSeeder;
        _contentSeeder = contentSeeder;
        _jobsSeeder = jobsSeeder;
        _eventsSeeder = eventsSeeder;
        _networkSeeder = networkSeeder;
        _messagingSeeder = messagingSeeder;
        _contentEngagementSeeder = contentEngagementSeeder;
        _pagesGroupsSeeder = pagesGroupsSeeder;
        _userLookup = userLookup;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogDebug("Demo seed orchestrator skipped: DemoSeed:Enabled is false.");
            return;
        }

        if (_options.Reset)
        {
            _logger.LogWarning(
                "Demo seed Reset=true is configured but not implemented in Step 5.1A; continuing without reset.");
        }

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        if (users.Count < _options.MinUsers)
        {
            _logger.LogWarning(
                "Demo seed orchestrator: found {Found} configured user(s), MinUsers={MinUsers}. Continuing with partial seed.",
                users.Count,
                _options.MinUsers);
        }

        _logger.LogInformation("Demo seed orchestrator started.");

        await RunStepAsync("DemoUsersSeeder", () => _usersSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoProfileSeeder", () => _profileSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoContentSeeder", () => _contentSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoJobsSeeder", () => _jobsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoEventsSeeder", () => _eventsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoNetworkSeeder", () => _networkSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoMessagingSeeder", () => _messagingSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoContentEngagementSeeder", () => _contentEngagementSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoPagesGroupsSeeder", () => _pagesGroupsSeeder.SeedAsync(cancellationToken));

        _logger.LogInformation("Demo seed orchestrator finished.");
    }

    private async Task RunStepAsync(string stepName, Func<Task> action)
    {
        try
        {
            _logger.LogInformation("Demo seed step starting: {StepName}.", stepName);
            await action();
            _logger.LogInformation("Demo seed step completed: {StepName}.", stepName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Demo seed step failed: {StepName}.", stepName);
        }
    }
}
