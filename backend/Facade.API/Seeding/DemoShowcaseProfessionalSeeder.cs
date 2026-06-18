using Microsoft.Extensions.Logging;
using Professional.Contracts.Services;
using Professional.DataAccess;

namespace Facade.API.Seeding;

public sealed partial class DemoShowcaseProfessionalSeeder : IDemoSeeder
{
    public int Order => 9;

    public string Name => nameof(DemoShowcaseProfessionalSeeder);

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
}
