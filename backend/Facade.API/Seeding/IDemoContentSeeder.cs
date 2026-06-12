namespace Facade.API.Seeding;

public interface IDemoContentSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
