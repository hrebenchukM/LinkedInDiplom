using Jobs.Client;
using Jobs.Client.Contracts;
using Jobs.Client.Contracts.Resources;
using Jobs.Client.Resources;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.Services.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Jobs.DI;

public static class JobsModuleServiceCollectionExtensions
{
    public static IServiceCollection AddJobsModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        services.AddDbContext<JobsDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "jobs")));

        services.AddScoped<IVacancyService, VacancyService>();
        services.AddScoped<IUserVacancyFavoriteService, UserVacancyFavoriteService>();
        services.AddScoped<IJobApplicationService, JobApplicationService>();
        services.AddScoped<IJobSearchQueryService, JobSearchQueryService>();
        services.AddScoped<IJobSearchResultService, JobSearchResultService>();
        services.AddScoped<IRecommendedJobQueryService, RecommendedJobQueryService>();

        services.AddScoped<IVacancyResource, VacancyResource>();
        services.AddScoped<IUserVacancyFavoriteResource, UserVacancyFavoriteResource>();
        services.AddScoped<IJobApplicationResource, JobApplicationResource>();
        services.AddScoped<IJobSearchQueryResource, JobSearchQueryResource>();
        services.AddScoped<IJobSearchResultResource, JobSearchResultResource>();
        services.AddScoped<IRecommendedJobQueryResource, RecommendedJobQueryResource>();

        services.AddScoped<IJobsClient, JobsClient>();

        return services;
    }
}
