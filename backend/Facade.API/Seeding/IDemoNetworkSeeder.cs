namespace Facade.API.Seeding;

public interface IDemoNetworkSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
