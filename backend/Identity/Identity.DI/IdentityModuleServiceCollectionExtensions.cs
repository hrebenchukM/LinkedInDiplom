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

namespace Identity.DI;

public static class IdentityModuleServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
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
        services.AddHttpClient();

        services.AddScoped<IDomainEventPublisher, InMemoryDomainEventPublisher>();

        services.AddScoped<IUserResource, UserResource>();
        services.AddScoped<IAuthenticationResource, AuthenticationResource>();
        services.AddScoped<IExternalAuthResource, ExternalAuthResource>();
        services.AddScoped<IIdentityClient, IdentityClient>();

        return services;
    }
}
