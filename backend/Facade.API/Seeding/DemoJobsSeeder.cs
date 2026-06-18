using Identity.DataAccess.Entities;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed class DemoJobsSeeder : IDemoSeeder
{
    public int Order => 10;

    public string Name => nameof(DemoJobsSeeder);

    private const string AdminEmail = DemoSeedConstants.AdminEmail;
    private const string DemoCompanyName = DemoSeedConstants.DemoCompanyName;

    private readonly JobsDbContext _jobsDb;
    private readonly ProfessionalDbContext _professionalDb;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoJobsSeeder> _logger;

    public DemoJobsSeeder(
        JobsDbContext jobsDb,
        ProfessionalDbContext professionalDb,
        DemoSeedUserLookup userLookup,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoJobsSeeder> logger)
    {
        _jobsDb = jobsDb;
        _professionalDb = professionalDb;
        _userLookup = userLookup;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var admin = _userLookup.TryGet(users, AdminEmail);
        if (admin is null)
        {
            _logger.LogWarning("Demo jobs seed skipped: admin user {Email} was not found.", AdminEmail);
            return;
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var existingDemoVacancies = await _jobsDb.Vacancies
            .AsNoTracking()
            .CountAsync(v => v.DeletedAt == null && v.Title.StartsWith(marker), cancellationToken);

        if (existingDemoVacancies >= 2)
        {
            _logger.LogInformation(
                "Demo jobs seed skipped: {Count} demo vacancy/vacancies already exist.",
                existingDemoVacancies);
            return;
        }

        var company = await EnsureDemoCompanyAsync(admin, marker, cancellationToken);
        var vacancyTemplates = new[]
        {
            new { Title = $"{marker}Junior Frontend Developer", JobType = "full-time", Schedule = "remote", Location = "Remote", SalaryFrom = 45000m, SalaryTo = 65000m },
            new { Title = $"{marker}Backend .NET Developer", JobType = "full-time", Schedule = "hybrid", Location = "Kyiv, Ukraine", SalaryFrom = 50000m, SalaryTo = 75000m },
        };

        var created = 0;
        foreach (var template in vacancyTemplates)
        {
            var exists = await _jobsDb.Vacancies
                .AnyAsync(v => v.DeletedAt == null && v.Title == template.Title, cancellationToken);

            if (exists)
            {
                _logger.LogDebug("Demo jobs seed: vacancy {Title} already exists; skipped.", template.Title);
                continue;
            }

            var vacancy = new Vacancy
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                PostedBy = admin.Id,
                Title = template.Title,
                JobType = template.JobType,
                Schedule = template.Schedule,
                Location = template.Location,
                SalaryFrom = template.SalaryFrom,
                SalaryTo = template.SalaryTo,
                SalaryCurrency = "USD",
                Description = $"{marker} Diploma demo vacancy for local development.",
                PostedAt = DateTime.UtcNow,
            };

            _jobsDb.Vacancies.Add(vacancy);
            created++;
        }

        if (created > 0)
        {
            await _jobsDb.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation("Demo jobs seed finished: {Created} vacancy/vacancies created.", created);
    }

    private async Task<Company> EnsureDemoCompanyAsync(
        ApplicationUser admin,
        string marker,
        CancellationToken cancellationToken)
    {
        var companyName = $"{marker}{DemoCompanyName}";

        var existing = await _professionalDb.Companies
            .FirstOrDefaultAsync(
                c => c.DeletedAt == null && c.OwnerUserId == admin.Id && c.Name == companyName,
                cancellationToken);

        if (existing is not null)
        {
            return existing;
        }

        var company = new Company
        {
            Id = Guid.NewGuid(),
            OwnerUserId = admin.Id,
            Name = companyName,
            Industry = "Technology",
            Location = "Remote",
            Description = $"{marker} Demo company for diploma project seed data.",
            CreatedAt = DateTime.UtcNow,
        };

        _professionalDb.Companies.Add(company);
        await _professionalDb.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Demo jobs seed: created company {CompanyName}.", companyName);
        return company;
    }
}
