using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Profile.DataAccess;

// Это нужно ТОЛЬКО для миграций Profile-модуля.
// Когда ты пишешь:
// dotnet ef migrations add AddProfileModule
// EF должен создать ProfileDbContext.
public class ProfileDbContextFactory : IDesignTimeDbContextFactory<ProfileDbContext>
{
    public ProfileDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ProfileDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "profile"));

        return new ProfileDbContext(optionsBuilder.Options);
    }
}