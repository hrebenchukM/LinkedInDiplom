using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Facade.API.Seeding;

public sealed partial class DemoBotContentSeeder
{
    private void AttachImageToPost(Post post, DemoBotPersona persona, int postIndex, DateTime createdAt)
    {
        var media = new Media
        {
            Id = Guid.NewGuid(),
            Url = DemoBotCatalog.ImageUrlFor(persona, postIndex),
            Type = MediaTypeImage,
            CreatedAt = createdAt,
        };

        _contentDb.Media.Add(media);
        _contentDb.PostMedia.Add(new PostMedia
        {
            Id = Guid.NewGuid(),
            PostId = post.Id,
            MediaId = media.Id,
            CreatedAt = createdAt,
        });
    }

    private Task<bool> PostHasMediaAsync(Guid postId, CancellationToken cancellationToken) =>
        _contentDb.PostMedia.AnyAsync(link => link.PostId == postId, cancellationToken);
}
