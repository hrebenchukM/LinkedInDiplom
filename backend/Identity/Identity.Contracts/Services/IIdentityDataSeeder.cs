namespace Identity.Contracts.Services;

public interface IIdentityDataSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
