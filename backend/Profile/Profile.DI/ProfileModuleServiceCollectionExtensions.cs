using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Profile.Client;
using Profile.Client.Contracts;
using Profile.Client.Contracts.Resources;
using Profile.Client.Resources;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.Services.Services;
using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Profile.Services.EventHandlers;

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

        // Регистрируем сервис профиля.
        // Это бизнес-логика Profile-модуля.
        services.AddScoped<IProfileService, ProfileService>();

        // Регистрируем обработчик события UserRegisteredEvent.
        // Когда Identity создаёт пользователя, Profile создаёт пустой профиль.
        services.AddScoped<
            IDomainEventHandler<UserRegisteredEvent>,
            CreateEmptyProfileWhenUserRegisteredHandler>();


        // Регистрируем Resource-слой Profile-модуля.
        // Это внутренняя точка доступа к ProfileService.
        services.AddScoped<IProfileResource, ProfileResource>();

        // Регистрируем Client-слой Profile-модуля.
        // Facade-модули будут обращаться к Profile через IProfileClient,
        // как AccountManagement обращается к Identity через IIdentityClient.
        services.AddScoped<IProfileClient, ProfileClient>();

        return services;
    }
}