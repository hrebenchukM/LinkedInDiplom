using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Parameters.Education;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed partial class DemoShowcaseProfessionalSeeder
{
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
}
