using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Identity.DataAccess;

public class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();
        
        // Use a default connection string for migrations
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity"));

        return new IdentityDbContext(optionsBuilder.Options);
    }
}
