using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Recommendation;

namespace Facade.API.Seeding;

public sealed partial class DemoShowcaseProfessionalSeeder
{
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
