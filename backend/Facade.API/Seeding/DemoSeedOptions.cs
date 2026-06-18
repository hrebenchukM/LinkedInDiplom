namespace Facade.API.Seeding;

public class DemoSeedOptions
{
    public bool Enabled { get; set; }

    /// <summary>
    /// Not implemented: when true, orchestrator logs a warning and continues without deleting or resetting demo data.
    /// To fully re-seed, drop the development database and restart the API.
    /// </summary>
    public bool Reset { get; set; }

    public int MinUsers { get; set; } = 3;

    public string DefaultUserPassword { get; set; } = string.Empty;

    public string PrimaryDemoUserEmail { get; set; } = DemoSeedConstants.PrimaryDemoUserEmail;

    public string PrimaryDemoUserPassword { get; set; } = "Mgg101204";

    public string MarkerPrefix { get; set; } = DemoSeedConstants.DefaultMarkerPrefix;

    /// <summary>
    /// Emails resolved by <see cref="DemoSeedUserLookup"/> for baseline seeders (profile, content, network, jobs, events, etc.).
    /// Admin is created by Identity <c>AdminSeed</c>, not <see cref="DemoUsersSeeder"/>.
    /// Showcase users (Marya, Emma, bots) are created by showcase/bot seeders via their own email lists.
    /// </summary>
    public string[] UserEmails { get; set; } = Array.Empty<string>();
}
