using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Profile.Client.Contracts.Services;
using Profile.Client.Services;

namespace Profile.Client;

// DI для подключения Profile HTTP Client
public static class ProfileClientServiceCollectionExtensions
{
    public static IServiceCollection AddProfileClient(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var baseUrl = configuration["Services:ProfileApi"]
            ?? throw new InvalidOperationException("Services:ProfileApi is not configured.");

        services.AddHttpClient<IProfileClient, ProfileClient>(client =>
        {
            client.BaseAddress = new Uri(baseUrl);
        });

        return services;
    }
}