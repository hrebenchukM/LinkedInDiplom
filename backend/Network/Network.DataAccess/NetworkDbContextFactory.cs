using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Network.DataAccess;

// Нужно только для EF migrations Network-модуля.
// dotnet ef migrations add AddNetworkModule --project Network.DataAccess
public class NetworkDbContextFactory : IDesignTimeDbContextFactory<NetworkDbContext>
{
    public NetworkDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<NetworkDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "network"));

        return new NetworkDbContext(optionsBuilder.Options);
    }
}
