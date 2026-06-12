using AI.Contracts.Configuration;
using AI.Contracts.Services;
using AI.Services.Services;
using Facade.AI.Contracts.Services;
using Facade.AI.Services.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.AI.DI;

public static class AIManagementServiceCollectionExtensions
{
    public static IServiceCollection AddAIManagementFacade(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<GeminiSettings>(configuration.GetSection("Gemini"));
        services.AddHttpClient();
        services.AddScoped<IAIService, AIService>();
        services.AddScoped<IAIManagementService, AIManagementService>();

        return services;
    }
}
