namespace Facade.API.Seeding;

internal sealed record DemoJobCompany(
    Guid Id,
    string Name,
    string Industry,
    string Location,
    string? WebsiteUrl);

internal sealed record DemoJobVacancy(
    Guid CompanyId,
    string Title,
    string JobType,
    string Schedule,
    string Location,
    decimal SalaryFrom,
    decimal SalaryTo,
    string SalaryCurrency,
    string Description,
    int PostedDaysAgo);

internal static class DemoJobsCatalog
{
    internal const string PosterEmail = DemoSeedConstants.AdminEmail;

    internal static readonly DemoJobCompany[] Companies =
    [
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4001"),
            "NovaStack",
            "SaaS · Developer tools",
            "Berlin, Germany",
            "https://novastack.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4002"),
            "CloudForge",
            "Cloud infrastructure",
            "Warsaw, Poland",
            "https://cloudforge.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4003"),
            "Pipeline Labs",
            "DevOps · Platform engineering",
            "Remote",
            "https://pipelinelabs.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4004"),
            "LinkUp Talent",
            "Professional network",
            "London, UK",
            "https://linkup.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4005"),
            "PixelNorth",
            "Design · Product studios",
            "Amsterdam, Netherlands",
            "https://pixelnorth.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4006"),
            "Insight Analytics",
            "Data · ML platforms",
            "Dublin, Ireland",
            "https://insightanalytics.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4007"),
            "QualityFirst",
            "QA · Test automation",
            "Prague, Czech Republic",
            "https://qualityfirst.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4008"),
            "AppCraft",
            "Mobile · Consumer apps",
            "Barcelona, Spain",
            "https://appcraft.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4009"),
            "ShieldOps",
            "Cybersecurity",
            "Munich, Germany",
            "https://shieldops.example"),
        new(
            new Guid("f3a8c1e2-4b5d-6e7f-8a9b-0c1d2e3f4010"),
            "ScaleBridge",
            "Enterprise software",
            "Toronto, Canada",
            "https://scalebridge.example"),
    ];

    internal static readonly DemoJobVacancy[] Vacancies =
    [
        new(
            Companies[0].Id,
            "Senior Frontend Engineer",
            "full-time",
            "Remote",
            "Berlin, Germany",
            90000,
            120000,
            "USD",
            "Build the next generation of our React design system and feed experiences. TypeScript, accessibility, and performance matter here.",
            2),
        new(
            Companies[1].Id,
            "Backend .NET Developer",
            "full-time",
            "Hybrid",
            "Warsaw, Poland",
            80000,
            110000,
            "USD",
            "Join a modular monolith team shipping APIs with .NET 8, EF Core, and PostgreSQL. Experience with clean architecture is a plus.",
            4),
        new(
            Companies[2].Id,
            "DevOps Engineer",
            "full-time",
            "Remote",
            "Remote",
            95000,
            130000,
            "USD",
            "Own CI/CD pipelines, Docker workloads, and observability for a growing SaaS platform. Terraform and Kubernetes welcome.",
            1),
        new(
            Companies[3].Id,
            "Product Manager",
            "full-time",
            "Hybrid",
            "London, UK",
            85000,
            105000,
            "USD",
            "Drive roadmap for network, jobs, and profile modules. Work closely with engineering and design in a fast-moving product squad.",
            6),
        new(
            Companies[4].Id,
            "UX Designer",
            "full-time",
            "On-site",
            "Amsterdam, Netherlands",
            70000,
            95000,
            "USD",
            "Shape end-to-end flows for a professional network used daily by thousands. Portfolio with B2B or social products preferred.",
            8),
        new(
            Companies[5].Id,
            "Data Scientist",
            "full-time",
            "Remote",
            "Dublin, Ireland",
            88000,
            115000,
            "USD",
            "Experiment with recommendation models for jobs and people-you-may-know. Python, SQL, and clear experiment design required.",
            3),
        new(
            Companies[6].Id,
            "QA Automation Engineer",
            "full-time",
            "Hybrid",
            "Prague, Czech Republic",
            65000,
            85000,
            "USD",
            "Expand Playwright and API test coverage across a modular monolith. You will partner with developers on quality gates in CI.",
            5),
        new(
            Companies[7].Id,
            "Mobile Engineer (React Native)",
            "full-time",
            "Remote",
            "Barcelona, Spain",
            75000,
            100000,
            "USD",
            "Ship cross-platform features for messaging and notifications. Strong React Native fundamentals and release discipline expected.",
            7),
        new(
            Companies[8].Id,
            "Security Engineer",
            "full-time",
            "Hybrid",
            "Munich, Germany",
            100000,
            135000,
            "USD",
            "Harden authentication, review JWT flows, and lead threat modeling for new modules. AppSec background in web APIs is ideal.",
            9),
        new(
            Companies[9].Id,
            "Engineering Manager",
            "full-time",
            "Hybrid",
            "Toronto, Canada",
            120000,
            150000,
            "USD",
            "Lead a squad of 6–8 engineers across profile and professional modules. Coaching, hiring, and pragmatic delivery are core to the role.",
            11),
    ];

    internal static readonly string[] RecommendedQueries =
    [
        "React developer",
        "Frontend developer",
        ".NET developer",
        "Remote",
        "UI designer",
        "Product manager",
        "DevOps",
        "Warsaw",
    ];

    internal const string DemoApplicationApplicantEmail = DemoSeedConstants.PrimaryDemoUserEmail;

    /// <summary>
    /// Catalog vacancy used for the pre-seeded withdraw demo (posted by admin, not the applicant).
    /// </summary>
    internal static readonly DemoJobVacancy DemoApplicationVacancy = Vacancies[0];
}
