using Identity.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Facade.API.Extensions;

// Расширение для автоматического применения миграций при запуске API
public static class DatabaseExtensions
{
    // Метод будет вызываться в Program.cs: await app.ApplyMigrationsAsync();
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