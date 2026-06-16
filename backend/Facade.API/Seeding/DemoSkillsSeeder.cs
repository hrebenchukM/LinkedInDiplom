using Microsoft.EntityFrameworkCore;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only skill catalog so profile "Add skill" works on a fresh database.
/// </summary>
public class DemoSkillsSeeder : IDemoSkillsSeeder
{
    private readonly ProfessionalDbContext _professionalDb;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DemoSkillsSeeder> _logger;

    public DemoSkillsSeeder(
        ProfessionalDbContext professionalDb,
        IHostEnvironment environment,
        ILogger<DemoSkillsSeeder> logger)
    {
        _professionalDb = professionalDb;
        _environment = environment;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_environment.IsDevelopment())
        {
            return;
        }

        var added = 0;

        foreach (var entry in DemoSkillsCatalog.Skills)
        {
            var exists = await _professionalDb.Skills
                .AsNoTracking()
                .AnyAsync(
                    skill =>
                        skill.Id == entry.Id ||
                        EF.Functions.ILike(skill.Name, entry.Name),
                    cancellationToken);

            if (exists)
            {
                continue;
            }

            _professionalDb.Skills.Add(new Skill
            {
                Id = entry.Id,
                Name = entry.Name,
                Description = entry.Description,
                CreatedAt = DateTime.UtcNow,
            });
            added++;
        }

        if (added > 0)
        {
            await _professionalDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Seeded demo skills catalog: {Count} skills.", added);
        }
    }
}
