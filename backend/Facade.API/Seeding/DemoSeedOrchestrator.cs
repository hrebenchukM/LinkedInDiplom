using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoSeedOrchestrator : IDemoSeedOrchestrator
{
    private const int ExpectedStepCount = 24;

    private readonly DemoSeedOptions _options;
    private readonly IReadOnlyList<IDemoSeeder> _seeders;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoSeedOrchestrator> _logger;

    public DemoSeedOrchestrator(
        IOptions<DemoSeedOptions> options,
        IEnumerable<IDemoSeeder> seeders,
        DemoSeedUserLookup userLookup,
        ILogger<DemoSeedOrchestrator> logger)
    {
        _options = options.Value;
        _seeders = seeders.ToList();
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

        ValidateSeederRegistration();

        _logger.LogInformation("Demo seed orchestrator started.");

        var stepResults = new List<SeedStepResult>(ExpectedStepCount);
        var orderedSeeders = _seeders.OrderBy(static seeder => seeder.Order).ToList();

        foreach (var seeder in orderedSeeders)
        {
            stepResults.Add(await RunStepAsync(seeder, cancellationToken));
        }

        var succeededSteps = stepResults.Count(static r => r.Succeeded);
        var failedResults = stepResults.Where(static r => !r.Succeeded).ToList();

        if (failedResults.Count == 0)
        {
            _logger.LogInformation(
                "Demo seed orchestrator finished: {Succeeded}/{Total} steps succeeded, {Failed} failed.",
                succeededSteps,
                ExpectedStepCount,
                0);
        }
        else
        {
            _logger.LogWarning(
                "Demo seed orchestrator finished: {Succeeded}/{Total} steps succeeded, {Failed} failed: {FailedSteps}.",
                succeededSteps,
                ExpectedStepCount,
                failedResults.Count,
                string.Join(", ", failedResults.Select(static r => r.StepName)));
        }
    }

    private void ValidateSeederRegistration()
    {
        if (_seeders.Count != ExpectedStepCount)
        {
            _logger.LogWarning(
                "Demo seed orchestrator: expected {Expected} seeders, found {Found}.",
                ExpectedStepCount,
                _seeders.Count);
        }

        var duplicateOrders = _seeders
            .GroupBy(static seeder => seeder.Order)
            .Where(static group => group.Count() > 1)
            .Select(static group => group.Key)
            .OrderBy(static order => order)
            .ToList();

        if (duplicateOrders.Count > 0)
        {
            _logger.LogError(
                "Demo seed orchestrator: duplicate seeder Order value(s): {Orders}.",
                string.Join(", ", duplicateOrders));
        }

        var registeredOrders = _seeders.Select(static seeder => seeder.Order).ToHashSet();
        var missingOrders = Enumerable.Range(1, ExpectedStepCount)
            .Where(order => !registeredOrders.Contains(order))
            .ToList();

        if (missingOrders.Count > 0)
        {
            _logger.LogWarning(
                "Demo seed orchestrator: missing seeder Order value(s): {Orders}.",
                string.Join(", ", missingOrders));
        }
    }

    private async Task<SeedStepResult> RunStepAsync(IDemoSeeder seeder, CancellationToken cancellationToken)
    {
        var stepName = seeder.Name;
        var startedAtUtc = DateTime.UtcNow;

        try
        {
            _logger.LogInformation("Demo seed step starting: {StepName}.", stepName);
            await seeder.SeedAsync(cancellationToken);
            var finishedAtUtc = DateTime.UtcNow;
            var result = SeedStepResult.Success(stepName, startedAtUtc, finishedAtUtc);
            _logger.LogInformation(
                "Demo seed step completed: {StepName} in {DurationMs}ms.",
                stepName,
                result.DurationMs);
            return result;
        }
        catch (Exception ex)
        {
            var finishedAtUtc = DateTime.UtcNow;
            _logger.LogError(ex, "Demo seed step failed: {StepName}.", stepName);
            return SeedStepResult.Failed(stepName, startedAtUtc, finishedAtUtc, ex.Message);
        }
    }
}
