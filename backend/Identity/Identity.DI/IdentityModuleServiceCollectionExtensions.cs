using Identity.Client;
using Identity.Client.Contracts;
using Identity.Client.Contracts.Resources;
using Identity.Client.Resources;
using Identity.Contracts.Configuration;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Identity.Events;
using Identity.Events.Contracts.Abstractions;
using Identity.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using static System.Net.WebRequestMethods;

namespace Identity.DI;

/// <summary>
/// Регистрирует все зависимости Identity-модуля одной точкой входа.
/// Порядок важен: DbContext -> core services -> resources -> client.
/// </summary>
public static class IdentityModuleServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        //Это берёт настройки токена из appsettings.json.чтобы backend умел создавать JWT access token.
        services.Configure<JwtSettings>(options =>
        {
            configuration.GetSection("JwtSettings").Bind(options);
        });

        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.Password.RequiredUniqueChars = 1;

            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<IdentityDbContext>();

        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IExternalAuthService, ExternalAuthService>();
       
        //Нужно, чтобы backend мог делать HTTP - запросы.
        //Например, для Google login backend может проверить токен у Google.
        services.AddHttpClient();

        //для внутренних событий.пользователь зарегистрировался
        //события хранятся/обрабатываются внутри приложения в памяти.
        services.AddScoped<IDomainEventPublisher, InMemoryDomainEventPublisher>();

        //Это переходники между Identity.Client и настоящими сервисами.
        //Сейчас:Resource → вызывает сервис напрямую
        //Потом можно сделать:Resource → отправляет HTTP-запрос в Identity microservice

        services.AddScoped<IUserResource, UserResource>();
        services.AddScoped<IAuthenticationResource, AuthenticationResource>();
        services.AddScoped<IExternalAuthResource, ExternalAuthResource>();
        //лавный клиент Identity-модуля.
        services.AddScoped<IIdentityClient, IdentityClient>();

        return services;
    }
}

//снова Dependency Injection:
//файл говорит ASP.NET:
//“Подключи базу, пользователей, пароли, JWT, сервисы, Google login, ресурсы и IdentityClient.”
//То есть чтобы в Program.cs не писать 100 строк, ты пишешь одну.builder.Services.AddIdentityModule(configuration, connectionString);
//И весь Identity-модуль подключается.