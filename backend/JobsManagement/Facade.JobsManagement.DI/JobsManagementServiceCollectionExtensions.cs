using Facade.JobsManagement.Contracts.Services;
using Facade.JobsManagement.Services.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Facade.JobsManagement.DI;

public static class JobsManagementServiceCollectionExtensions
{
    public static IServiceCollection AddJobsManagementFacade(this IServiceCollection services)
    {
        services.AddScoped<IJobsManagementService, JobsManagementService>();

        return services;
    }
}
