using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only extended jobs catalog so the Jobs page has realistic vacancies on a fresh database.
/// Additive to <see cref="DemoJobsSeeder"/> — does not replace baseline seed data.
/// </summary>
public sealed class DemoJobsCatalogSeeder
{
    private readonly ProfessionalDbContext _professionalDb;
    private readonly JobsDbContext _jobsDb;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoJobsCatalogSeeder> _logger;

    public DemoJobsCatalogSeeder(
        ProfessionalDbContext professionalDb,
        JobsDbContext jobsDb,
        DemoSeedUserLookup userLookup,
        ILogger<DemoJobsCatalogSeeder> logger)
    {
        _professionalDb = professionalDb;
        _jobsDb = jobsDb;
        _userLookup = userLookup;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo jobs catalog seed started.");

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var poster = _userLookup.TryGet(users, DemoJobsCatalog.PosterEmail);
        if (poster is null)
        {
            _logger.LogWarning(
                "Demo jobs catalog seed skipped: poster {Email} was not found.",
                DemoJobsCatalog.PosterEmail);
            return;
        }

        var companiesAdded = 0;
        var companiesSkipped = 0;

        foreach (var company in DemoJobsCatalog.Companies)
        {
            var exists = await _professionalDb.Companies
                .AsNoTracking()
                .AnyAsync(
                    row =>
                        row.DeletedAt == null &&
                        (row.Id == company.Id ||
                         (row.Name == company.Name && row.OwnerUserId == poster.Id)),
                    cancellationToken);

            if (exists)
            {
                companiesSkipped++;
                continue;
            }

            _professionalDb.Companies.Add(new Company
            {
                Id = company.Id,
                OwnerUserId = poster.Id,
                Name = company.Name,
                Industry = company.Industry,
                Location = company.Location,
                WebsiteUrl = company.WebsiteUrl,
                Description = $"Demo company for {company.Name}.",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
            });
            companiesAdded++;
        }

        if (companiesAdded > 0)
        {
            await _professionalDb.SaveChangesAsync(cancellationToken);
        }

        var vacanciesAdded = 0;
        var vacanciesSkipped = 0;

        foreach (var vacancy in DemoJobsCatalog.Vacancies)
        {
            var exists = await _jobsDb.Vacancies
                .AsNoTracking()
                .AnyAsync(
                    row =>
                        row.DeletedAt == null &&
                        row.CompanyId == vacancy.CompanyId &&
                        row.Title == vacancy.Title,
                    cancellationToken);

            if (exists)
            {
                vacanciesSkipped++;
                continue;
            }

            _jobsDb.Vacancies.Add(new Vacancy
            {
                Id = Guid.NewGuid(),
                CompanyId = vacancy.CompanyId,
                PostedBy = poster.Id,
                Title = vacancy.Title,
                JobType = vacancy.JobType,
                Schedule = vacancy.Schedule,
                Location = vacancy.Location,
                SalaryFrom = vacancy.SalaryFrom,
                SalaryTo = vacancy.SalaryTo,
                SalaryCurrency = vacancy.SalaryCurrency,
                Description = vacancy.Description,
                PostedAt = DateTime.UtcNow.AddDays(-vacancy.PostedDaysAgo),
            });
            vacanciesAdded++;
        }

        if (vacanciesAdded > 0)
        {
            await _jobsDb.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation(
            "Demo jobs catalog seed finished: companies added {CompaniesAdded}, skipped {CompaniesSkipped}; vacancies added {VacanciesAdded}, skipped {VacanciesSkipped}.",
            companiesAdded,
            companiesSkipped,
            vacanciesAdded,
            vacanciesSkipped);
    }
}
