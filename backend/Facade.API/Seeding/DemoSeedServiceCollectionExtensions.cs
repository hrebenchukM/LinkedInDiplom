using Microsoft.Extensions.DependencyInjection;

namespace Facade.API.Seeding;

public static class DemoSeedServiceCollectionExtensions
{
    public static IServiceCollection AddDemoSeeders(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DemoSeedOptions>(configuration.GetSection("DemoSeed"));
        services.AddScoped<DemoSeedUserLookup>();
        services.AddScoped<DemoUsersSeeder>();
        services.AddScoped<DemoShowcaseUsersSeeder>();
        services.AddScoped<DemoSkillsSeeder>();
        services.AddScoped<DemoProfileSeeder>();
        services.AddScoped<DemoShowcaseProfileSeeder>();
        services.AddScoped<DemoContentSeeder>();
        services.AddScoped<DemoBotContentSeeder>();
        services.AddScoped<DemoShowcaseContentSeeder>();
        services.AddScoped<DemoShowcaseProfessionalSeeder>();
        services.AddScoped<DemoJobsSeeder>();
        services.AddScoped<DemoJobsCatalogSeeder>();
        services.AddScoped<DemoShowcaseJobsSeeder>();
        services.AddScoped<DemoEventsSeeder>();
        services.AddScoped<DemoShowcaseEventsSeeder>();
        services.AddScoped<DemoNetworkSeeder>();
        services.AddScoped<DemoBotNetworkSeeder>();
        services.AddScoped<DemoShowcaseNetworkSeeder>();
        services.AddScoped<DemoMessagingSeeder>();
        services.AddScoped<DemoShowcaseMessagingSeeder>();
        services.AddScoped<DemoContentEngagementSeeder>();
        services.AddScoped<DemoBotContentEngagementSeeder>();
        services.AddScoped<DemoPagesGroupsSeeder>();
        services.AddScoped<DemoNotificationsSeeder>();
        services.AddScoped<DemoShowcaseViewsSeeder>();
        services.AddScoped<IDemoSeedOrchestrator, DemoSeedOrchestrator>();
        return services;
    }
}
