namespace Facade.API.Seeding;

public interface IDemoSkillsSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
