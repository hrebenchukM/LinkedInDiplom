namespace Facade.API.Seeding;

/// <summary>
/// Shared demo seed identifiers and thresholds used across baseline and showcase seeders.
/// Values must stay aligned with <see cref="DemoSeedOptions"/> defaults and showcase catalogs.
/// </summary>
internal static class DemoSeedConstants
{
    public const string DefaultMarkerPrefix = "demo-seed:";

    public const string AdminEmail = "admin@local.dev";

    public const string TestUserOneEmail = "test@example.com";

    public const string TestUserTwoEmail = "test2@example.com";

    public const string PrimaryDemoUserEmail = "marya101204@gmail.com";

    public const string DemoCompanyName = "LinkUp Labs";

    public const int MinBaselineDemoPosts = 3;
}
