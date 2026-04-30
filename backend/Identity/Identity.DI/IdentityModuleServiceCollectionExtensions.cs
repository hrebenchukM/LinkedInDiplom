using Identity.Client;
using Identity.Client.Contracts;
using Identity.Client.Contracts.Resources;
using Identity.Client.Resources;
using Identity.Contracts.Configuration;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
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
        // Configure JWT settings
        services.Configure<JwtSettings>(options =>
        {
            configuration.GetSection("JwtSettings").Bind(options);
        });
        // Register DbContext
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(connectionString, 
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity")));

        // Register ASP.NET Core Identity
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.Password.RequiredUniqueChars = 1;

            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<IdentityDbContext>();

        // Register Core Services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<ITokenService, TokenService>();

        // Register Client Resources
        services.AddScoped<IUserResource, UserResource>();
        services.AddScoped<IAuthenticationResource, AuthenticationResource>();
        services.AddScoped<IIdentityClient, IdentityClient>();

        return services;
    }
}
