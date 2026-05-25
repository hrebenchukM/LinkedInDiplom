using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Professional.Client;
using Professional.Client.Contracts;
using Professional.Client.Contracts.Resources;
using Professional.Client.Resources;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.Services.Services;

namespace Professional.DI;

// Класс для подключения всего Professional-модуля одной строкой в Program.cs
public static class ProfessionalModuleServiceCollectionExtensions
{
    public static IServiceCollection AddProfessionalModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        // Регистрируем DbContext Professional-модуля
        services.AddDbContext<ProfessionalDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "professional")));

        // Регистрируем сервис опыта работы
        services.AddScoped<IExperienceService, ExperienceService>();
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IAcademyService, AcademyService>();
        services.AddScoped<IEducationService, EducationService>();
        services.AddScoped<ICertificateService, CertificateService>();
        services.AddScoped<ISkillService, SkillService>();
        services.AddScoped<IUserSkillService, UserSkillService>();
        services.AddScoped<ILanguageService, LanguageService>();
        services.AddScoped<IUserLanguageService, UserLanguageService>();

        // Регистрируем Resource-слой Professional-модуля
        services.AddScoped<IExperienceResource, ExperienceResource>();
        services.AddScoped<ICompanyResource, CompanyResource>();
        services.AddScoped<IAcademyResource, AcademyResource>();
        services.AddScoped<IEducationResource, EducationResource>();
        services.AddScoped<ICertificateResource, CertificateResource>();
        services.AddScoped<ISkillResource, SkillResource>();
        services.AddScoped<IUserSkillResource, UserSkillResource>();
        services.AddScoped<ILanguageResource, LanguageResource>();
        services.AddScoped<IUserLanguageResource, UserLanguageResource>();

        // Регистрируем Client-слой Professional-модуля
        services.AddScoped<IProfessionalClient, ProfessionalClient>();

        return services;
    }
}