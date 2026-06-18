using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Parameters.UserSkill;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed partial class DemoShowcaseProfessionalSeeder
{
    private async Task<Skill?> EnsureSkillAsync(string name, CancellationToken cancellationToken)
    {
        var existing = await _professionalDb.Skills
            .FirstOrDefaultAsync(s => s.Name == name, cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var result = await _skillService.CreateAsync(new CreateSkillParameters { Name = name });
        return result.Succeeded
            ? await _professionalDb.Skills.FirstOrDefaultAsync(s => s.Id == result.Skill!.Id, cancellationToken)
            : null;
    }

    private async Task EnsureUserSkillAsync(
        string userId,
        string skillName,
        string level,
        bool isMain,
        int orderIndex,
        CancellationToken cancellationToken)
    {
        var skill = await EnsureSkillAsync(skillName, cancellationToken);
        if (skill is null)
        {
            return;
        }

        var exists = await _professionalDb.UserSkills.AnyAsync(
            us => us.UserId == userId && us.SkillId == skill.Id,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _userSkillService.CreateAsync(new CreateUserSkillParameters
        {
            UserId = userId,
            SkillId = skill.Id,
            Level = level,
            IsMain = isMain,
            OrderIndex = orderIndex,
        });
    }

    private async Task<Language?> EnsureLanguageAsync(string name, CancellationToken cancellationToken)
    {
        var existing = await _professionalDb.Languages
            .FirstOrDefaultAsync(l => l.Name == name, cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var result = await _languageService.CreateAsync(new CreateLanguageParameters { Name = name });
        return result.Succeeded
            ? await _professionalDb.Languages.FirstOrDefaultAsync(l => l.Id == result.Language!.Id, cancellationToken)
            : null;
    }

    private async Task EnsureUserLanguageAsync(
        string userId,
        Guid languageId,
        string level,
        CancellationToken cancellationToken)
    {
        var exists = await _professionalDb.UserLanguages.AnyAsync(
            ul => ul.UserId == userId && ul.LanguageId == languageId,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _userLanguageService.CreateAsync(new CreateUserLanguageParameters
        {
            UserId = userId,
            LanguageId = languageId,
            Level = level,
        });
    }
}
