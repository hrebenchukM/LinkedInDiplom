namespace Facade.API.Seeding;

public interface IDemoJobsSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
