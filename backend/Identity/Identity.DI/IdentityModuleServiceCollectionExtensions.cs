using Identity.Client;                     // Реализация IdentityClient
using Identity.Client.Contracts;           // Интерфейс IIdentityClient
using Identity.Client.Contracts.Resources; // Интерфейсы ресурсов IUserResource, IAuthenticationResource
using Identity.Client.Resources;           // Реализации ресурсов UserResource, AuthenticationResource
using Identity.Contracts.Configuration;    // JwtSettings
using Identity.Contracts.Services;         // IUserService, IAuthenticationService, ITokenService
using Identity.DataAccess;                 // IdentityDbContext
using Identity.DataAccess.Entities;        // ApplicationUser
using Identity.Services;                   // UserService, AuthenticationService, TokenService
using Microsoft.AspNetCore.Identity;       // ASP.NET Core Identity
using Microsoft.EntityFrameworkCore;       // EF Core
using Microsoft.Extensions.Configuration;  // IConfiguration
using Microsoft.Extensions.DependencyInjection; // IServiceCollection

namespace Identity.DI;

// Класс для подключения всего Identity-модуля одной строкой в Program.cs
public static class IdentityModuleServiceCollectionExtensions
{
    // Метод расширения для DI-контейнера
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        // Читаем JwtSettings из appsettings.json
        services.Configure<JwtSettings>(options =>
        {
            configuration.GetSection("JwtSettings").Bind(options);
        });

        // Регистрируем DbContext и подключение к PostgreSQL
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

        // Подключаем ASP.NET Core Identity для ApplicationUser
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            // Настройки пароля
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.Password.RequiredUniqueChars = 1;

            // Настройки блокировки после неудачных попыток входа
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // Email должен быть уникальным
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>() // Добавляем роли
        .AddEntityFrameworkStores<IdentityDbContext>(); // Храним Identity-данные через EF Core

        // Регистрируем основные сервисы Identity
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<ITokenService, TokenService>();

        // Регистрируем Identity.Client слой
        services.AddScoped<IUserResource, UserResource>();
        services.AddScoped<IAuthenticationResource, AuthenticationResource>();
        services.AddScoped<IIdentityClient, IdentityClient>();

        // Возвращаем services для цепочки вызовов
        return services;
    }
}