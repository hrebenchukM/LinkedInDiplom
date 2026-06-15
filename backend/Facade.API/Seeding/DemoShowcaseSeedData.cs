namespace Facade.API.Seeding;

internal static class DemoShowcaseSeedData
{
    public const string AdminEmail = "admin@local.dev";
    public const string PrimaryDemoUserEmail = "marya101204@gmail.com";
    public const string LucasEmail = "test@example.com";
    public const string TestTwoEmail = "test2@example.com";
    public const string EmmaEmail = "designer@demo.com";
    public const string DavidJonsonEmail = "david.jonson@demo.com";
    public const string DavidJohnsonEmail = "david.johnson@demo.com";

    public static readonly string[] AdditionalUserEmails =
    [
        PrimaryDemoUserEmail,
        EmmaEmail,
        DavidJonsonEmail,
        DavidJohnsonEmail,
        "duncan.callahan@demo.com",
        "joshua.cortez@demo.com",
        "jennifer.obrian@demo.com",
        "emma.knight@demo.com",
        "michael.kennedy@demo.com",
        "sarah@google.com",
        "james@google.com",
        "emma@google.com",
        "michael@google.com",
        "james@demo.com",
        "emma.thompson@demo.com",
        "michael@demo.com",
    ];

    public static readonly (string Email, string First, string Last, string Title, string Location, string? Avatar)[] ProfileTemplates =
    [
        (PrimaryDemoUserEmail, "Marya", "Demo", "Lead UI/UX Designer", "Warsaw, Poland", "marya.jpg"),
        (LucasEmail, "Lucas", "Brown", "Frontend Developer", "Amsterdam, Netherlands", "lucas.jpg"),
        (EmmaEmail, "Emma", "Stone", "Junior UI/UX Designer", "Berlin, Germany", "emma.jpg"),
        (DavidJonsonEmail, "David", "Jonson", "Lead UI/UX Designer", "Warsaw, Poland", "david.png"),
        (DavidJohnsonEmail, "David", "Johnson", "Tech Lead at Amazon", "Seattle, USA", "david.jpg"),
        ("duncan.callahan@demo.com", "Duncan", "Callahan", "Lead UI/UX Designer", "London, UK", "duncan.png"),
        ("joshua.cortez@demo.com", "Joshua", "Cortez", "UI/UX Designer", "Madrid, Spain", "joshua.png"),
        ("jennifer.obrian@demo.com", "Jennifer", "OBrian", "UI/UX Designer", "Dublin, Ireland", "jennifer.png"),
        ("emma.knight@demo.com", "Emma", "Knight", "Senior UI/UX Designer", "Paris, France", "emma.png"),
        ("michael.kennedy@demo.com", "Michael", "Kennedy", "Junior UI/UX Designer", "Chicago, USA", "michael.png"),
        ("sarah@google.com", "Sarah", "Mitchell", "Design Director", "Mountain View, USA", "sarah.jpg"),
        ("james@google.com", "James", "Wilson", "Senior Designer", "San Francisco, USA", "james.jpg"),
        ("emma@google.com", "Emma", "Thompson", "Product Designer", "New York, USA", "emma.jpg"),
        ("michael@google.com", "Michael", "Chen", "UX Researcher", "Austin, USA", "michael.jpg"),
        ("james@demo.com", "James", "Wilson", "UX Lead at Meta", "Menlo Park, USA", "james.jpg"),
        ("emma.thompson@demo.com", "Emma", "Thompson", "Design Manager at Apple", "Cupertino, USA", "emma.jpg"),
        ("michael@demo.com", "Michael", "Chen", "Product Manager at Microsoft", "Redmond, USA", "michael.jpg"),
        (TestTwoEmail, "Test", "User Two", "Backend Developer", "Kyiv, Ukraine", null),
    ];
}
