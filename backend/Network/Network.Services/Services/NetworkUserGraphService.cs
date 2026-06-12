using Microsoft.EntityFrameworkCore;
using Network.Contracts.Parameters.Network;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;

namespace Network.Services.Services;

public class NetworkUserGraphService(NetworkDbContext dbContext) : INetworkUserGraphService
{
    private const string StatusAccepted = "accepted";

    public async Task<UserNetworkUserIdsResult> GetUserNetworkUserIdsAsync(
        GetUserNetworkUserIdsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var userId = parameters.UserId;

        var followingIds = await dbContext.Follows
            .AsNoTracking()
            .Where(f => f.FollowerId == userId && f.UnfollowedAt == null)
            .Select(f => f.FollowingId)
            .ToListAsync(cancellationToken);

        var contacts = await dbContext.Contacts
            .AsNoTracking()
            .Where(c =>
                c.Status == StatusAccepted &&
                (c.RequesterId == userId || c.ReceiverId == userId))
            .Select(c => new { c.RequesterId, c.ReceiverId })
            .ToListAsync(cancellationToken);

        var userIds = new HashSet<string>(StringComparer.Ordinal);

        foreach (var followingId in followingIds)
        {
            userIds.Add(followingId);
        }

        foreach (var contact in contacts)
        {
            var otherUserId = contact.RequesterId == userId
                ? contact.ReceiverId
                : contact.RequesterId;
            userIds.Add(otherUserId);
        }

        return new UserNetworkUserIdsResult
        {
            UserIds = userIds.ToList()
        };
    }
}
