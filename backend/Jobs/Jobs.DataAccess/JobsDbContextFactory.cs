using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Jobs.DataAccess;

public class JobsDbContextFactory : IDesignTimeDbContextFactory<JobsDbContext>
{
    public JobsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<JobsDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "jobs"));

        return new JobsDbContext(optionsBuilder.Options);
    }
}
