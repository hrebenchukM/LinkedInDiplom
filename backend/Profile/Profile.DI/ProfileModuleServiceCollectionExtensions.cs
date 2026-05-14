using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.Services.Services;

namespace Profile.DI;

// Класс для подключения всего Profile-модуля одной строкой в Program.cs
public static class ProfileModuleServiceCollectionExtensions
{
    // Метод расширения для DI-контейнера
    public static IServiceCollection AddProfileModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        // Регистрируем DbContext и подключение к PostgreSQL
        services.AddDbContext<ProfileDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "profile")));

        // Регистрируем сервис профиля
        services.AddScoped<IProfileService, ProfileService>();

        return services;
    }
}
