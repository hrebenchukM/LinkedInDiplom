using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Company;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed partial class DemoShowcaseProfessionalSeeder
{
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
}
