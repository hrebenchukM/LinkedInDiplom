using Identity.DataAccess.Entities;
using Jobs.Contracts.Parameters.JobSearchQuery;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseJobsSeeder : IDemoSeeder
{
    public int Order => 12;

    public string Name => nameof(DemoShowcaseJobsSeeder);

    private readonly JobsDbContext _jobsDb;
    private readonly ProfessionalDbContext _professionalDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly IJobSearchQueryService _jobSearchQueryService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseJobsSeeder> _logger;

    public DemoShowcaseJobsSeeder(
        JobsDbContext jobsDb,
        ProfessionalDbContext professionalDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        IJobSearchQueryService jobSearchQueryService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseJobsSeeder> logger)
    {
        _jobsDb = jobsDb;
        _professionalDb = professionalDb;
        _identityDb = identityDb;
        _jobSearchQueryService = jobSearchQueryService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase jobs seed started.");

        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            [DemoShowcaseSeedData.PrimaryDemoUserEmail],
            cancellationToken);

        if (!users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            _logger.LogWarning("Demo showcase jobs seed skipped: primary demo user not found.");
            return;
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var companyTemplates = new (string Name, string Logo, string Location)[]
        {
            ("Classpass", "classpass.jpg", "USA"),
            ("Airtable", "airtable.jpg", "USA"),
            ("Wealthsimple", "wealthsimple.jpg", "Remote"),
            ("Dribbble", "dribbble.jpg", "Remote"),
            ("Freshworks", "freshworks.jpg", "Brazil"),
        };

        var companies = new Dictionary<string, Company>(StringComparer.OrdinalIgnoreCase);
        foreach (var template in companyTemplates)
        {
            var company = await EnsureJobCompanyAsync(marya.Id, template.Name, template.Logo, template.Location, cancellationToken);
            if (company is not null)
            {
                companies[template.Name] = company;
            }
        }

        var vacancyTemplates = new (string Company, string Title, string Location, decimal From, decimal To, string Schedule)[]
        {
            ("Classpass", "Walmart", "Denison AL", 145000m, 225000m, "on-site"),
            ("Airtable", "Walmart", "Las Vegas NM", 155000m, 215000m, "on-site"),
            ("Wealthsimple", "Varsity Tutors (Remote)", "Remote", 205000m, 285000m, "remote"),
            ("Dribbble", "Graphic Designer", "United States (Remote)", 90000m, 140000m, "remote"),
            ("Freshworks", "Graphic Designer", "Florianópolis Brazil (Remote)", 80000m, 120000m, "remote"),
        };

        var createdVacancies = 0;
        foreach (var template in vacancyTemplates)
        {
            if (!companies.TryGetValue(template.Company, out var company))
            {
                continue;
            }

            var title = $"{marker}{template.Title} @ {template.Company}";
            if (await EnsureVacancyAsync(
                    marya.Id,
                    company.Id,
                    title,
                    template.Location,
                    template.From,
                    template.To,
                    template.Schedule,
                    cancellationToken))
            {
                createdVacancies++;
            }
        }

        var queries = new[] { "marketing manager", "hr", "legal", "sales", "google", "analyst", "amazon" };
        foreach (var query in queries)
        {
            var exists = await _jobsDb.JobSearchQueries.AnyAsync(
                q => q.UserId == marya.Id && q.Query == query && q.DeletedAt == null,
                cancellationToken);

            if (exists)
            {
                continue;
            }

            await _jobSearchQueryService.CreateAsync(new CreateJobSearchQueryParameters
            {
                UserId = marya.Id,
                Query = query,
            });
        }

        _logger.LogInformation(
            "Demo showcase jobs seed finished: {Vacancies} vacancy/vacancies created.",
            createdVacancies);
    }

    private async Task<Company?> EnsureJobCompanyAsync(
        string ownerUserId,
        string name,
        string logoUrl,
        string location,
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

        var company = new Company
        {
            Id = Guid.NewGuid(),
            OwnerUserId = ownerUserId,
            Name = name,
            LogoUrl = logoUrl,
            Industry = "Technology",
            Location = location,
            Description = $"Demo job company: {name}",
            CreatedAt = DateTime.UtcNow,
        };

        _professionalDb.Companies.Add(company);
        await _professionalDb.SaveChangesAsync(cancellationToken);
        return company;
    }

    private async Task<bool> EnsureVacancyAsync(
        string postedBy,
        Guid companyId,
        string title,
        string location,
        decimal salaryFrom,
        decimal salaryTo,
        string schedule,
        CancellationToken cancellationToken)
    {
        var exists = await _jobsDb.Vacancies.AnyAsync(
            v => v.DeletedAt == null && v.CompanyId == companyId && v.Title == title && v.Location == location,
            cancellationToken);

        if (exists)
        {
            return false;
        }

        _jobsDb.Vacancies.Add(new Vacancy
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            PostedBy = postedBy,
            Title = title,
            JobType = "full-time",
            Schedule = schedule,
            Location = location,
            SalaryFrom = salaryFrom,
            SalaryTo = salaryTo,
            SalaryCurrency = "USD",
            Description = "Demo vacancy seeded for frontend showcase.",
            PostedAt = DateTime.UtcNow,
        });

        await _jobsDb.SaveChangesAsync(cancellationToken);
        return true;
    }
}
