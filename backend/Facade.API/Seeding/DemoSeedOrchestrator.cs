using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoSeedOrchestrator : IDemoSeedOrchestrator
{
    private readonly DemoSeedOptions _options;
    private readonly DemoUsersSeeder _usersSeeder;
    private readonly DemoShowcaseUsersSeeder _showcaseUsersSeeder;
    private readonly DemoProfileSeeder _profileSeeder;
    private readonly DemoShowcaseProfileSeeder _showcaseProfileSeeder;
    private readonly DemoContentSeeder _contentSeeder;
    private readonly DemoShowcaseContentSeeder _showcaseContentSeeder;
    private readonly DemoShowcaseProfessionalSeeder _showcaseProfessionalSeeder;
    private readonly DemoJobsSeeder _jobsSeeder;
    private readonly DemoShowcaseJobsSeeder _showcaseJobsSeeder;
    private readonly DemoEventsSeeder _eventsSeeder;
    private readonly DemoShowcaseEventsSeeder _showcaseEventsSeeder;
    private readonly DemoNetworkSeeder _networkSeeder;
    private readonly DemoShowcaseNetworkSeeder _showcaseNetworkSeeder;
    private readonly DemoMessagingSeeder _messagingSeeder;
    private readonly DemoShowcaseMessagingSeeder _showcaseMessagingSeeder;
    private readonly DemoContentEngagementSeeder _contentEngagementSeeder;
    private readonly DemoPagesGroupsSeeder _pagesGroupsSeeder;
    private readonly DemoNotificationsSeeder _notificationsSeeder;
    private readonly DemoShowcaseViewsSeeder _showcaseViewsSeeder;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoSeedOrchestrator> _logger;

    public DemoSeedOrchestrator(
        IOptions<DemoSeedOptions> options,
        DemoUsersSeeder usersSeeder,
        DemoShowcaseUsersSeeder showcaseUsersSeeder,
        DemoProfileSeeder profileSeeder,
        DemoShowcaseProfileSeeder showcaseProfileSeeder,
        DemoContentSeeder contentSeeder,
        DemoShowcaseContentSeeder showcaseContentSeeder,
        DemoShowcaseProfessionalSeeder showcaseProfessionalSeeder,
        DemoJobsSeeder jobsSeeder,
        DemoShowcaseJobsSeeder showcaseJobsSeeder,
        DemoEventsSeeder eventsSeeder,
        DemoShowcaseEventsSeeder showcaseEventsSeeder,
        DemoNetworkSeeder networkSeeder,
        DemoShowcaseNetworkSeeder showcaseNetworkSeeder,
        DemoMessagingSeeder messagingSeeder,
        DemoShowcaseMessagingSeeder showcaseMessagingSeeder,
        DemoContentEngagementSeeder contentEngagementSeeder,
        DemoPagesGroupsSeeder pagesGroupsSeeder,
        DemoNotificationsSeeder notificationsSeeder,
        DemoShowcaseViewsSeeder showcaseViewsSeeder,
        DemoSeedUserLookup userLookup,
        ILogger<DemoSeedOrchestrator> logger)
    {
        _options = options.Value;
        _usersSeeder = usersSeeder;
        _showcaseUsersSeeder = showcaseUsersSeeder;
        _profileSeeder = profileSeeder;
        _showcaseProfileSeeder = showcaseProfileSeeder;
        _contentSeeder = contentSeeder;
        _showcaseContentSeeder = showcaseContentSeeder;
        _showcaseProfessionalSeeder = showcaseProfessionalSeeder;
        _jobsSeeder = jobsSeeder;
        _showcaseJobsSeeder = showcaseJobsSeeder;
        _eventsSeeder = eventsSeeder;
        _showcaseEventsSeeder = showcaseEventsSeeder;
        _networkSeeder = networkSeeder;
        _showcaseNetworkSeeder = showcaseNetworkSeeder;
        _messagingSeeder = messagingSeeder;
        _showcaseMessagingSeeder = showcaseMessagingSeeder;
        _contentEngagementSeeder = contentEngagementSeeder;
        _pagesGroupsSeeder = pagesGroupsSeeder;
        _notificationsSeeder = notificationsSeeder;
        _showcaseViewsSeeder = showcaseViewsSeeder;
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
                "Demo seed Reset=true is configured but not implemented; continuing without reset.");
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
        await RunStepAsync("DemoShowcaseUsersSeeder", () => _showcaseUsersSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoProfileSeeder", () => _profileSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseProfileSeeder", () => _showcaseProfileSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoContentSeeder", () => _contentSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseContentSeeder", () => _showcaseContentSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseProfessionalSeeder", () => _showcaseProfessionalSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoJobsSeeder", () => _jobsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseJobsSeeder", () => _showcaseJobsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoEventsSeeder", () => _eventsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseEventsSeeder", () => _showcaseEventsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoNetworkSeeder", () => _networkSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseNetworkSeeder", () => _showcaseNetworkSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoMessagingSeeder", () => _messagingSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseMessagingSeeder", () => _showcaseMessagingSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoContentEngagementSeeder", () => _contentEngagementSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoPagesGroupsSeeder", () => _pagesGroupsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoNotificationsSeeder", () => _notificationsSeeder.SeedAsync(cancellationToken));
        await RunStepAsync("DemoShowcaseViewsSeeder", () => _showcaseViewsSeeder.SeedAsync(cancellationToken));

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
