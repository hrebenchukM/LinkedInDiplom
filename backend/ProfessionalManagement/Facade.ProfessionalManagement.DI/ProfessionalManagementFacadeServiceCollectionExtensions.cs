using Facade.ProfessionalManagement.Contracts.Services;
using Facade.ProfessionalManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.ProfessionalManagement.DI;

// DI-класс для подключения ProfessionalManagement фасада одной строкой
public static class ProfessionalManagementFacadeServiceCollectionExtensions
{
    public static IServiceCollection AddProfessionalManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IProfessionalManagementService, ProfessionalManagementService>();

        return services;
    }
}