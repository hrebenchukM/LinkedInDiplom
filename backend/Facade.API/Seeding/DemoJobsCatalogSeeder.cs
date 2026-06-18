using Jobs.Contracts.Parameters.JobApplication;
using Jobs.Contracts.Parameters.RecommendedJobQuery;
using Jobs.Contracts.Services;
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
public sealed class DemoJobsCatalogSeeder : IDemoSeeder
{
    public int Order => 11;

    public string Name => nameof(DemoJobsCatalogSeeder);

    private readonly ProfessionalDbContext _professionalDb;
    private readonly JobsDbContext _jobsDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly IRecommendedJobQueryService _recommendedJobQueryService;
    private readonly IJobApplicationService _jobApplicationService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoJobsCatalogSeeder> _logger;

    public DemoJobsCatalogSeeder(
        ProfessionalDbContext professionalDb,
        JobsDbContext jobsDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        IRecommendedJobQueryService recommendedJobQueryService,
        IJobApplicationService jobApplicationService,
        DemoSeedUserLookup userLookup,
        ILogger<DemoJobsCatalogSeeder> logger)
    {
        _professionalDb = professionalDb;
        _jobsDb = jobsDb;
        _identityDb = identityDb;
        _recommendedJobQueryService = recommendedJobQueryService;
        _jobApplicationService = jobApplicationService;
        _userLookup = userLookup;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo jobs catalog seed started.");

        await SeedRecommendedQueriesAsync(cancellationToken);

        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var poster = _userLookup.TryGet(users, DemoJobsCatalog.PosterEmail);
        if (poster is null)
        {
            _logger.LogWarning(
                "Demo jobs catalog seed skipped companies/vacancies: poster {Email} was not found.",
                DemoJobsCatalog.PosterEmail);
        }
        else
        {
            await SeedCatalogCompaniesAndVacanciesAsync(poster, cancellationToken);
        }

        await SeedDemoApplicationAsync(cancellationToken);
    }

    private async Task SeedCatalogCompaniesAndVacanciesAsync(
        Identity.DataAccess.Entities.ApplicationUser poster,
        CancellationToken cancellationToken)
    {
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

    private async Task SeedRecommendedQueriesAsync(CancellationToken cancellationToken)
    {
        var added = 0;
        var skipped = 0;

        foreach (var query in DemoJobsCatalog.RecommendedQueries)
        {
            var queryText = query.Trim();
            var exists = await _jobsDb.RecommendedJobQueries
                .AsNoTracking()
                .AnyAsync(row => row.Query == queryText, cancellationToken);

            if (exists)
            {
                skipped++;
                continue;
            }

            var result = await _recommendedJobQueryService.CreateAsync(new CreateRecommendedJobQueryParameters
            {
                UserId = string.Empty,
                Query = queryText,
            });

            if (!result.Succeeded)
            {
                _logger.LogWarning(
                    "Demo jobs catalog seed: failed to create recommended query {Query}: {Errors}",
                    queryText,
                    string.Join(", ", result.Errors));
                continue;
            }

            added++;
        }

        _logger.LogInformation(
            "Demo jobs catalog seed: recommended queries added {Added}, skipped {Skipped}.",
            added,
            skipped);
    }

    private async Task SeedDemoApplicationAsync(CancellationToken cancellationToken)
    {
        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            [DemoJobsCatalog.DemoApplicationApplicantEmail],
            cancellationToken);

        if (!users.TryGetValue(DemoJobsCatalog.DemoApplicationApplicantEmail, out var applicant))
        {
            _logger.LogWarning(
                "Demo jobs catalog seed: demo application skipped because applicant {Email} was not found.",
                DemoJobsCatalog.DemoApplicationApplicantEmail);
            return;
        }

        var vacancyTemplate = DemoJobsCatalog.DemoApplicationVacancy;
        var vacancy = await _jobsDb.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(
                row =>
                    row.DeletedAt == null &&
                    row.CompanyId == vacancyTemplate.CompanyId &&
                    row.Title == vacancyTemplate.Title,
                cancellationToken);

        if (vacancy is null)
        {
            _logger.LogWarning(
                "Demo jobs catalog seed: demo application skipped because vacancy {Title} was not found.",
                vacancyTemplate.Title);
            return;
        }

        if (vacancy.PostedBy == applicant.Id)
        {
            _logger.LogWarning(
                "Demo jobs catalog seed: demo application skipped because applicant cannot apply to own vacancy {Title}.",
                vacancy.Title);
            return;
        }

        var hasActiveApplication = await _jobsDb.JobApplications
            .AnyAsync(
                row =>
                    row.UserId == applicant.Id &&
                    row.VacancyId == vacancy.Id &&
                    row.WithdrawnAt == null,
                cancellationToken);

        if (hasActiveApplication)
        {
            _logger.LogInformation(
                "Demo jobs catalog seed: demo application already exists for {Email} on vacancy {Title}; skipped.",
                applicant.Email,
                vacancy.Title);
            return;
        }

        var result = await _jobApplicationService.ApplyAsync(new ApplyToVacancyParameters
        {
            UserId = applicant.Id,
            VacancyId = vacancy.Id,
        });

        if (!result.Succeeded)
        {
            _logger.LogWarning(
                "Demo jobs catalog seed: failed to create demo application for {Email} on vacancy {Title}: {Errors}",
                applicant.Email,
                vacancy.Title,
                string.Join(", ", result.Errors));
            return;
        }

        _logger.LogInformation(
            "Demo jobs catalog seed: created demo application {ApplicationId} for {Email} on vacancy {Title} (status={Status}).",
            result.JobApplication?.Id,
            applicant.Email,
            vacancy.Title,
            result.JobApplication?.Status ?? "applied");
    }
}
