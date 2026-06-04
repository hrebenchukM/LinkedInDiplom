using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Professional.DataAccess;

// Нужно только для EF migrations Professional-модуля
public class ProfessionalDbContextFactory : IDesignTimeDbContextFactory<ProfessionalDbContext>
{
    public ProfessionalDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ProfessionalDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "professional"));

        return new ProfessionalDbContext(optionsBuilder.Options);
    }
}