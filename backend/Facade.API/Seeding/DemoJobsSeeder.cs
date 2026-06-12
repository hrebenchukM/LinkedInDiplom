using Identity.DataAccess.Entities;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

/// <summary>
/// Dev-only demo companies and vacancies so the Jobs page looks populated on a fresh database.
/// Idempotent: skips existing companies/vacancies by stable ids or title+company pairs.
/// </summary>
public class DemoJobsSeeder : IDemoJobsSeeder
{
    private readonly ProfessionalDbContext _professionalDb;
    private readonly JobsDbContext _jobsDb;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DemoJobsSeeder> _logger;

    public DemoJobsSeeder(
        ProfessionalDbContext professionalDb,
        JobsDbContext jobsDb,
        UserManager<ApplicationUser> userManager,
        IHostEnvironment environment,
        ILogger<DemoJobsSeeder> logger)
    {
        _professionalDb = professionalDb;
        _jobsDb = jobsDb;
        _userManager = userManager;
        _environment = environment;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_environment.IsDevelopment())
        {
            return;
        }

        var poster = await _userManager.FindByEmailAsync(DemoJobsCatalog.PosterEmail);
        if (poster?.Id == null)
        {
            _logger.LogWarning(
                "Demo jobs seed skipped: poster {Email} not found.",
                DemoJobsCatalog.PosterEmail);
            return;
        }

        var companiesAdded = await EnsureCompaniesAsync(poster.Id, cancellationToken);
        var vacanciesAdded = await EnsureVacanciesAsync(poster.Id, cancellationToken);

        if (companiesAdded > 0)
        {
            await _professionalDb.SaveChangesAsync(cancellationToken);
        }

        if (vacanciesAdded > 0)
        {
            await _jobsDb.SaveChangesAsync(cancellationToken);
        }

        if (companiesAdded > 0 || vacanciesAdded > 0)
        {
            _logger.LogInformation(
                "Seeded demo jobs: {Companies} companies, {Vacancies} vacancies.",
                companiesAdded,
                vacanciesAdded);
        }
    }

    private async Task<int> EnsureCompaniesAsync(string ownerUserId, CancellationToken cancellationToken)
    {
        var added = 0;

        foreach (var company in DemoJobsCatalog.Companies)
        {
            var exists = await _professionalDb.Companies.AnyAsync(
                row => row.Id == company.Id || (row.Name == company.Name && row.OwnerUserId == ownerUserId),
                cancellationToken);

            if (exists)
            {
                continue;
            }

            _professionalDb.Companies.Add(new Company
            {
                Id = company.Id,
                OwnerUserId = ownerUserId,
                Name = company.Name,
                Industry = company.Industry,
                Location = company.Location,
                WebsiteUrl = company.WebsiteUrl,
                Description = $"Demo company for {company.Name}.",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
            });

            added++;
        }

        return added;
    }

    private async Task<int> EnsureVacanciesAsync(string posterUserId, CancellationToken cancellationToken)
    {
        var added = 0;

        foreach (var vacancy in DemoJobsCatalog.Vacancies)
        {
            var exists = await _jobsDb.Vacancies.AnyAsync(
                row =>
                    row.DeletedAt == null &&
                    row.CompanyId == vacancy.CompanyId &&
                    row.Title == vacancy.Title,
                cancellationToken);

            if (exists)
            {
                continue;
            }

            var postedAt = DateTime.UtcNow.AddDays(-vacancy.PostedDaysAgo);

            _jobsDb.Vacancies.Add(new Vacancy
            {
                Id = Guid.NewGuid(),
                CompanyId = vacancy.CompanyId,
                PostedBy = posterUserId,
                Title = vacancy.Title,
                JobType = vacancy.JobType,
                Schedule = vacancy.Schedule,
                Location = vacancy.Location,
                SalaryFrom = vacancy.SalaryFrom,
                SalaryTo = vacancy.SalaryTo,
                SalaryCurrency = vacancy.SalaryCurrency,
                Description = vacancy.Description,
                PostedAt = postedAt,
                UpdatedAt = null,
                DeletedAt = null,
            });

            added++;
        }

        return added;
    }
}
