using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Parameters.Experience;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Parameters.UserSkill;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseProfessionalSeeder
{
    private readonly ProfessionalDbContext _professionalDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly ICompanyService _companyService;
    private readonly IExperienceService _experienceService;
    private readonly IEducationService _educationService;
    private readonly IAcademyService _academyService;
    private readonly ICertificateService _certificateService;
    private readonly ISkillService _skillService;
    private readonly IUserSkillService _userSkillService;
    private readonly ILanguageService _languageService;
    private readonly IUserLanguageService _userLanguageService;
    private readonly IRecommendationService _recommendationService;
    private readonly ILogger<DemoShowcaseProfessionalSeeder> _logger;

    public DemoShowcaseProfessionalSeeder(
        ProfessionalDbContext professionalDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        ICompanyService companyService,
        IExperienceService experienceService,
        IEducationService educationService,
        IAcademyService academyService,
        ICertificateService certificateService,
        ISkillService skillService,
        IUserSkillService userSkillService,
        ILanguageService languageService,
        IUserLanguageService userLanguageService,
        IRecommendationService recommendationService,
        ILogger<DemoShowcaseProfessionalSeeder> logger)
    {
        _professionalDb = professionalDb;
        _identityDb = identityDb;
        _companyService = companyService;
        _experienceService = experienceService;
        _educationService = educationService;
        _academyService = academyService;
        _certificateService = certificateService;
        _skillService = skillService;
        _userSkillService = userSkillService;
        _languageService = languageService;
        _userLanguageService = userLanguageService;
        _recommendationService = recommendationService;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase professional seed started.");

        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            new[]
            {
                DemoShowcaseSeedData.PrimaryDemoUserEmail,
                DemoShowcaseSeedData.DavidJonsonEmail,
                "james@demo.com",
                "emma.thompson@demo.com",
            },
            cancellationToken);

        if (users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            await SeedMaryaProfessionalAsync(marya, users, cancellationToken);
        }

        if (users.TryGetValue(DemoShowcaseSeedData.DavidJonsonEmail, out var david))
        {
            await SeedDavidJonsonProfessionalAsync(david, users, cancellationToken);
        }

        _logger.LogInformation("Demo showcase professional seed finished.");
    }

    private async Task SeedMaryaProfessionalAsync(
        ApplicationUser marya,
        IReadOnlyDictionary<string, ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        var cdpr = await EnsureCompanyAsync(
            marya.Id,
            "CD Project Red",
            "cdpr.png",
            "Game Development",
            "Warsaw, Poland",
            "https://en.cdprojektred.com",
            "AAA game development studio",
            cancellationToken);

        await EnsureCompanyAsync(
            marya.Id,
            "Microsoft",
            "microsoft.png",
            "Technology",
            "Redmond, USA",
            "https://www.microsoft.com",
            "Global technology company",
            cancellationToken);

        await EnsureCompanyAsync(
            marya.Id,
            "Sony",
            "sony.png",
            "Electronics & Entertainment",
            "Tokyo, Japan",
            "https://www.sony.com",
            "Multinational conglomerate",
            cancellationToken);

        await EnsureExperienceAsync(
            marya.Id,
            cdpr?.Id,
            "Lead UI/UX Designer",
            "full-time",
            "on-site",
            "Warsaw, Poland",
            new DateOnly(2021, 11, 1),
            null,
            "Led design systems and product UX for flagship titles.",
            cancellationToken);

        var ucla = await EnsureAcademyAsync("University of California, Los Angeles (UCLA)", "ucla.png", "https://www.ucla.edu", cancellationToken);
        var warsawUni = await EnsureAcademyAsync("Warsaw University", null, null, cancellationToken);
        var creolab = await EnsureAcademyAsync("Creolab Design Courses", "creolab.png", "https://creolab.io", cancellationToken);
        var cybergenia = await EnsureAcademyAsync("Cybergenia IT Academy", "cybergenia.png", "https://cybergenia.com", cancellationToken);

        await EnsureEducationAsync(
            marya.Id,
            ucla?.Id,
            "University of California, Los Angeles (UCLA)",
            "Bachelor",
            "Computer Science",
            new DateOnly(2014, 9, 1),
            new DateOnly(2018, 6, 1),
            cancellationToken);

        await EnsureEducationAsync(
            marya.Id,
            warsawUni?.Id,
            "Warsaw University",
            "Master",
            "UI/UX Design",
            new DateOnly(2018, 9, 1),
            new DateOnly(2020, 6, 1),
            cancellationToken);

        await EnsureCertificateAsync(
            marya.Id,
            creolab?.Id,
            "UI/UX Designer Certificate",
            "d752710b-e2d3-49f5-862c-983635d6c4b8.pdf",
            new DateOnly(2019, 8, 1),
            new DateOnly(2020, 8, 1),
            cancellationToken);

        await EnsureCertificateAsync(
            marya.Id,
            cybergenia?.Id,
            "User Experience Specialist",
            "d752710b-e2d3-49f5-862c-983635d6c4b8.pdf",
            new DateOnly(2017, 11, 1),
            new DateOnly(2018, 11, 1),
            cancellationToken);

        await EnsureUserSkillAsync(marya.Id, "Communication skills", "advanced", true, 1, cancellationToken);
        await EnsureUserSkillAsync(marya.Id, "Technical skills", "intermediate", false, 2, cancellationToken);
        await EnsureUserSkillAsync(marya.Id, "UI/UX Design", "advanced", false, 3, cancellationToken);
        await EnsureUserSkillAsync(marya.Id, "Figma", "advanced", false, 4, cancellationToken);
        await EnsureUserSkillAsync(marya.Id, "User Interface Design", "advanced", false, 5, cancellationToken);
        await EnsureUserSkillAsync(marya.Id, "User Experience Design", "advanced", false, 6, cancellationToken);

        var english = await EnsureLanguageAsync("English", cancellationToken);
        var german = await EnsureLanguageAsync("German", cancellationToken);
        if (english is not null)
        {
            await EnsureUserLanguageAsync(marya.Id, english.Id, "Professional proficiency", cancellationToken);
        }

        if (german is not null)
        {
            await EnsureUserLanguageAsync(marya.Id, german.Id, "Native or bilingual", cancellationToken);
        }

        if (users.TryGetValue("james@demo.com", out var james))
        {
            await EnsureRecommendationAsync(
                james.Id,
                marya.Id,
                "Marya is an outstanding designer with strong product thinking and attention to detail.",
                cancellationToken);
        }

        if (users.TryGetValue("emma.thompson@demo.com", out var emmaThompson))
        {
            await EnsureRecommendationAsync(
                emmaThompson.Id,
                marya.Id,
                "Marya consistently delivers elegant and user-centered solutions.",
                cancellationToken);
        }
    }

    private async Task SeedDavidJonsonProfessionalAsync(
        ApplicationUser david,
        IReadOnlyDictionary<string, ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        var cdpr = await EnsureCompanyAsync(
            david.Id,
            "CD Projekt Red",
            null,
            "Game Development",
            "Warsaw, Poland",
            null,
            null,
            cancellationToken);

        var buildCo = await EnsureCompanyAsync(
            david.Id,
            "Build.co",
            null,
            "Design Platform",
            "Remote",
            null,
            null,
            cancellationToken);

        await EnsureExperienceAsync(
            david.Id,
            cdpr?.Id,
            "Lead UI/UX Designer",
            "full-time",
            "hybrid",
            "Warsaw, Poland",
            new DateOnly(2018, 1, 1),
            null,
            "Led design systems and product UX.",
            cancellationToken);

        await EnsureExperienceAsync(
            david.Id,
            buildCo?.Id,
            "Senior UI/UX Designer",
            "full-time",
            "remote",
            "Remote",
            new DateOnly(2016, 1, 1),
            new DateOnly(2018, 1, 1),
            "Designed complex UI platforms.",
            cancellationToken);

        var warsawUni = await EnsureAcademyAsync("Warsaw University", null, null, cancellationToken);
        await EnsureAcademyAsync("Design Course Academy", null, null, cancellationToken);

        await EnsureEducationAsync(
            david.Id,
            warsawUni?.Id,
            "Warsaw University",
            "Bachelor",
            "UI/UX Design",
            new DateOnly(2010, 9, 1),
            new DateOnly(2014, 6, 1),
            cancellationToken);

        await EnsureCertificateAsync(
            david.Id,
            null,
            "UI/UX Complete Certificate",
            null,
            new DateOnly(2015, 5, 1),
            new DateOnly(2020, 5, 1),
            cancellationToken);

        var english = await EnsureLanguageAsync("English", cancellationToken);
        var german = await EnsureLanguageAsync("German", cancellationToken);
        if (english is not null)
        {
            await EnsureUserLanguageAsync(david.Id, english.Id, "Professional proficiency", cancellationToken);
        }

        if (german is not null)
        {
            await EnsureUserLanguageAsync(david.Id, german.Id, "Native or bilingual", cancellationToken);
        }

        await EnsureUserSkillAsync(david.Id, "User Interface Design", "advanced", true, 1, cancellationToken);
        await EnsureUserSkillAsync(david.Id, "User Experience Design", "advanced", false, 2, cancellationToken);

        if (users.TryGetValue("james@demo.com", out var james))
        {
            await EnsureRecommendationAsync(
                james.Id,
                david.Id,
                "David is an outstanding designer with strong product thinking and attention to detail.",
                cancellationToken);
        }

        if (users.TryGetValue("emma.thompson@demo.com", out var emmaThompson))
        {
            await EnsureRecommendationAsync(
                emmaThompson.Id,
                david.Id,
                "David consistently delivers elegant and user-centered solutions.",
                cancellationToken);
        }
    }

    private async Task<Company?> EnsureCompanyAsync(
        string ownerUserId,
        string name,
        string? logoUrl,
        string? industry,
        string? location,
        string? websiteUrl,
        string? description,
        CancellationToken cancellationToken)
    {
        var existing = await _professionalDb.Companies
            .FirstOrDefaultAsync(
                c => c.DeletedAt == null && c.OwnerUserId == ownerUserId && c.Name == name,
                cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var result = await _companyService.CreateAsync(new CreateCompanyParameters
        {
            OwnerUserId = ownerUserId,
            Name = name,
            LogoUrl = logoUrl,
            Industry = industry,
            Location = location,
            WebsiteUrl = websiteUrl,
            Description = description,
        });

        if (!result.Succeeded)
        {
            _logger.LogWarning(
                "Demo showcase professional seed: failed to create company {Name}: {Errors}",
                name,
                string.Join(", ", result.Errors));
            return null;
        }

        return await _professionalDb.Companies
            .FirstOrDefaultAsync(c => c.Id == result.Company!.Id, cancellationToken);
    }

    private async Task EnsureExperienceAsync(
        string userId,
        Guid? companyId,
        string position,
        string employmentType,
        string workLocationType,
        string location,
        DateOnly startDate,
        DateOnly? endDate,
        string description,
        CancellationToken cancellationToken)
    {
        var exists = await _professionalDb.Experiences.AnyAsync(
            e =>
                e.DeletedAt == null &&
                e.UserId == userId &&
                e.Position == position &&
                e.StartDate == startDate,
            cancellationToken);

        if (exists)
        {
            return;
        }

        var result = await _experienceService.CreateAsync(new CreateExperienceParameters
        {
            UserId = userId,
            CompanyId = companyId,
            Position = position,
            EmploymentType = employmentType,
            WorkLocationType = workLocationType,
            Location = location,
            StartDate = startDate,
            EndDate = endDate,
            Description = description,
        });

        if (!result.Succeeded)
        {
            _logger.LogWarning(
                "Demo showcase professional seed: failed experience {Position}: {Errors}",
                position,
                string.Join(", ", result.Errors));
        }
    }

    private async Task<Academy?> EnsureAcademyAsync(
        string name,
        string? logoUrl,
        string? websiteUrl,
        CancellationToken cancellationToken)
    {
        var existing = await _professionalDb.Academies
            .FirstOrDefaultAsync(a => a.Name == name, cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var result = await _academyService.CreateAsync(new CreateAcademyParameters
        {
            Name = name,
            LogoUrl = logoUrl,
            WebsiteUrl = websiteUrl,
        });

        return result.Succeeded
            ? await _professionalDb.Academies.FirstOrDefaultAsync(a => a.Id == result.Academy!.Id, cancellationToken)
            : null;
    }

    private async Task EnsureEducationAsync(
        string userId,
        Guid? academyId,
        string institution,
        string degree,
        string fieldOfStudy,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken)
    {
        var exists = await _professionalDb.Educations.AnyAsync(
            e =>
                e.DeletedAt == null &&
                e.UserId == userId &&
                e.Institution == institution &&
                e.StartDate == startDate,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _educationService.CreateAsync(new CreateEducationParameters
        {
            UserId = userId,
            AcademyId = academyId,
            Institution = institution,
            Degree = degree,
            FieldOfStudy = fieldOfStudy,
            StartDate = startDate,
            EndDate = endDate,
            Source = "demo-seed",
        });
    }

    private async Task EnsureCertificateAsync(
        string userId,
        Guid? academyId,
        string name,
        string? downloadRef,
        DateOnly issueDate,
        DateOnly expiryDate,
        CancellationToken cancellationToken)
    {
        var exists = await _professionalDb.Certificates.AnyAsync(
            c =>
                c.DeletedAt == null &&
                c.UserId == userId &&
                c.Name == name,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _certificateService.CreateAsync(new CreateCertificateParameters
        {
            UserId = userId,
            AcademyId = academyId,
            Name = name,
            DownloadRef = downloadRef,
            IssueDate = issueDate,
            ExpiryDate = expiryDate,
        });
    }

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

    private async Task EnsureRecommendationAsync(
        string authorId,
        string userId,
        string text,
        CancellationToken cancellationToken)
    {
        var exists = await _professionalDb.Recommendations.AnyAsync(
            r => r.DeletedAt == null && r.AuthorId == authorId && r.UserId == userId && r.Text == text,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _recommendationService.CreateAsync(new CreateRecommendationParameters
        {
            AuthorId = authorId,
            UserId = userId,
            Text = text,
        });
    }
}
