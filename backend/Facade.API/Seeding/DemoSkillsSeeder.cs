using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only global skills catalog so profile "Add skill" works on a fresh database.
/// </summary>
public sealed class DemoSkillsSeeder
{
    private readonly ProfessionalDbContext _professionalDb;
    private readonly ILogger<DemoSkillsSeeder> _logger;

    public DemoSkillsSeeder(
        ProfessionalDbContext professionalDb,
        ILogger<DemoSkillsSeeder> logger)
    {
        _professionalDb = professionalDb;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo skills seed started.");

        var added = 0;
        var skipped = 0;

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
                skipped++;
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
        }

        _logger.LogInformation(
            "Demo skills seed finished: added {Added}, skipped {Skipped}.",
            added,
            skipped);
    }
}
