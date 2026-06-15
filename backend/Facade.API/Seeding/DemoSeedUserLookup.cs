using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoSeedUserLookup
{
    private readonly IdentityDbContext _identityDb;
    private readonly DemoSeedOptions _options;
    private readonly ILogger _logger;

    public DemoSeedUserLookup(
        IdentityDbContext identityDb,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoSeedUserLookup> logger)
    {
        _identityDb = identityDb;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyDictionary<string, ApplicationUser>> ResolveConfiguredUsersAsync(
        CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, ApplicationUser>(StringComparer.OrdinalIgnoreCase);

        foreach (var email in _options.UserEmails.Where(e => !string.IsNullOrWhiteSpace(e)))
        {
            var normalized = email.Trim();
            var user = await _identityDb.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    u => u.Email == normalized && u.DeletedAt == null,
                    cancellationToken);

            if (user is null)
            {
                _logger.LogWarning("Demo seed: user {Email} was not found; skipping related steps.", normalized);
                continue;
            }

            result[normalized] = user;
        }

        return result;
    }

    public ApplicationUser? TryGet(IReadOnlyDictionary<string, ApplicationUser> users, string email) =>
        users.TryGetValue(email.Trim(), out var user) ? user : null;
}
