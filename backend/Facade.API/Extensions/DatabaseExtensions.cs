using Content.DataAccess;
using Events.DataAccess;
using Facade.API.Seeding;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Jobs.DataAccess;
using Microsoft.EntityFrameworkCore;
using Messaging.DataAccess;
using Network.DataAccess;
using Notifications.DataAccess;
using Profile.DataAccess;
using Professional.DataAccess;
namespace Facade.API.Extensions;

/// <summary>
/// Инфраструктурное расширение host-слоя.
/// Применяет EF Core миграции модулей в фиксированном порядке при запуске Facade.API.
/// </summary>
public static class DatabaseExtensions
{
    /// <summary>
    /// Применяет миграции всех модулей modular monolith.
    /// Порядок важен: сначала Identity, затем остальные модули.
    /// </summary>
    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        // Создаём scope, чтобы получить сервисы из DI
        using var scope = app.Services.CreateScope();

        // Получаем ServiceProvider
        var services = scope.ServiceProvider;

        // Получаем logger
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            // Пишем в лог, что начинаем миграции
            logger.LogInformation("Applying database migrations...");

            // Получаем IdentityDbContext из DI
            var identityContext = services.GetRequiredService<IdentityDbContext>();

            // Применяем миграции Identity-модуля
            await identityContext.Database.MigrateAsync();

            var identityDataSeeder = services.GetRequiredService<IIdentityDataSeeder>();
            await identityDataSeeder.SeedAsync();

            // Получаем ProfileDbContext из DI
            var profileContext = services.GetRequiredService<ProfileDbContext>();

            // Применяем миграции Profile-модуля
            await profileContext.Database.MigrateAsync();

            // Получаем ProfessionalDbContext из DI
            var professionalContext = services.GetRequiredService<ProfessionalDbContext>();

            // Применяем миграции Professional-модуля
            await professionalContext.Database.MigrateAsync();

            var demoSkillsSeeder = services.GetRequiredService<IDemoSkillsSeeder>();
            await demoSkillsSeeder.SeedAsync();

            // Получаем NetworkDbContext из DI
            var networkContext = services.GetRequiredService<NetworkDbContext>();

            // Применяем миграции Network-модуля
            await networkContext.Database.MigrateAsync();

            // Получаем ContentDbContext из DI
            var contentContext = services.GetRequiredService<ContentDbContext>();

            // Применяем миграции Content-модуля
            await contentContext.Database.MigrateAsync();

            var demoContentSeeder = services.GetRequiredService<IDemoContentSeeder>();
            await demoContentSeeder.SeedAsync();

            var demoNetworkSeeder = services.GetRequiredService<IDemoNetworkSeeder>();
            await demoNetworkSeeder.SeedAsync();

            // Получаем MessagingDbContext из DI
            var messagingContext = services.GetRequiredService<MessagingDbContext>();

            // Применяем миграции Messaging-модуля
            await messagingContext.Database.MigrateAsync();

            // Получаем JobsDbContext из DI
            var jobsContext = services.GetRequiredService<JobsDbContext>();

            // Применяем миграции Jobs-модуля
            await jobsContext.Database.MigrateAsync();

            var demoJobsSeeder = services.GetRequiredService<IDemoJobsSeeder>();
            await demoJobsSeeder.SeedAsync();

            // Получаем NotificationsDbContext из DI
            var notificationsContext = services.GetRequiredService<NotificationsDbContext>();

            // Применяем миграции Notifications-модуля
            await notificationsContext.Database.MigrateAsync();

            // Получаем EventsDbContext из DI
            var eventsContext = services.GetRequiredService<EventsDbContext>();

            // Применяем миграции Events-модуля
            await eventsContext.Database.MigrateAsync();

            // Пишем в лог успешный результат
            logger.LogInformation("Database migrations applied successfully");
        }
        catch (Exception ex)
        {
            // Если ошибка — пишем её в лог
            logger.LogError(ex, "An error occurred while applying database migrations");

            // Пробрасываем ошибку дальше
            throw;
        }
    }
}