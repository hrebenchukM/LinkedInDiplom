namespace Facade.API.Seeding;

public interface IDemoSeedOrchestrator
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
