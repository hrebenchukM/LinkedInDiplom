namespace Facade.API.Seeding;

public static class DemoSeedServiceCollectionExtensions
{
    public static IServiceCollection AddDemoSeeders(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DemoSeedOptions>(configuration.GetSection("DemoSeed"));
        services.AddScoped<DemoSeedUserLookup>();
        services.AddScoped<DemoUsersSeeder>();
        services.AddScoped<DemoProfileSeeder>();
        services.AddScoped<DemoContentSeeder>();
        services.AddScoped<DemoJobsSeeder>();
        services.AddScoped<DemoEventsSeeder>();
        services.AddScoped<DemoNetworkSeeder>();
        services.AddScoped<DemoMessagingSeeder>();
        services.AddScoped<DemoContentEngagementSeeder>();
        services.AddScoped<DemoPagesGroupsSeeder>();
        services.AddScoped<IDemoSeedOrchestrator, DemoSeedOrchestrator>();
        return services;
    }
}
