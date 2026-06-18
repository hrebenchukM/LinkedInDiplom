namespace Facade.API.Seeding;

public interface IDemoSeeder
{
    int Order { get; }

    string Name { get; }

    Task SeedAsync(CancellationToken cancellationToken = default);
}
