using Microsoft.EntityFrameworkCore;
using Professional.Contracts.Parameters.Experience;

namespace Facade.API.Seeding;

public sealed partial class DemoShowcaseProfessionalSeeder
{
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
}
