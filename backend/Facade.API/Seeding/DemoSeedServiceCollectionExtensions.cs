using Microsoft.Extensions.DependencyInjection;

namespace Facade.API.Seeding;

public static class DemoSeedServiceCollectionExtensions
{
    public static IServiceCollection AddDemoSeeders(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DemoSeedOptions>(configuration.GetSection("DemoSeed"));
        services.AddScoped<DemoSeedUserLookup>();
        services.AddDemoSeeder<DemoUsersSeeder>();
        services.AddDemoSeeder<DemoShowcaseUsersSeeder>();
        services.AddDemoSeeder<DemoSkillsSeeder>();
        services.AddDemoSeeder<DemoProfileSeeder>();
        services.AddDemoSeeder<DemoShowcaseProfileSeeder>();
        services.AddDemoSeeder<DemoContentSeeder>();
        services.AddDemoSeeder<DemoBotContentSeeder>();
        services.AddDemoSeeder<DemoShowcaseContentSeeder>();
        services.AddDemoSeeder<DemoShowcaseProfessionalSeeder>();
        services.AddDemoSeeder<DemoJobsSeeder>();
        services.AddDemoSeeder<DemoJobsCatalogSeeder>();
        services.AddDemoSeeder<DemoShowcaseJobsSeeder>();
        services.AddDemoSeeder<DemoEventsSeeder>();
        services.AddDemoSeeder<DemoShowcaseEventsSeeder>();
        services.AddDemoSeeder<DemoNetworkSeeder>();
        services.AddDemoSeeder<DemoBotNetworkSeeder>();
        services.AddDemoSeeder<DemoShowcaseNetworkSeeder>();
        services.AddDemoSeeder<DemoMessagingSeeder>();
        services.AddDemoSeeder<DemoShowcaseMessagingSeeder>();
        services.AddDemoSeeder<DemoContentEngagementSeeder>();
        services.AddDemoSeeder<DemoBotContentEngagementSeeder>();
        services.AddDemoSeeder<DemoPagesGroupsSeeder>();
        services.AddDemoSeeder<DemoNotificationsSeeder>();
        services.AddDemoSeeder<DemoShowcaseViewsSeeder>();
        services.AddScoped<IDemoSeedOrchestrator, DemoSeedOrchestrator>();
        return services;
    }

    private static IServiceCollection AddDemoSeeder<TSeeder>(this IServiceCollection services)
        where TSeeder : class, IDemoSeeder
    {
        services.AddScoped<TSeeder>();
        services.AddScoped<IDemoSeeder>(sp => sp.GetRequiredService<TSeeder>());
        return services;
    }
}
