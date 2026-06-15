namespace Facade.API.Seeding;

public class DemoSeedOptions
{
    public bool Enabled { get; set; }

    public bool Reset { get; set; }

    public int MinUsers { get; set; } = 3;

    public string DefaultUserPassword { get; set; } = string.Empty;

    public string PrimaryDemoUserEmail { get; set; } = "marya101204@gmail.com";

    public string PrimaryDemoUserPassword { get; set; } = "Mgg101204";

    public string MarkerPrefix { get; set; } = "demo-seed:";

    public string[] UserEmails { get; set; } = Array.Empty<string>();
}
