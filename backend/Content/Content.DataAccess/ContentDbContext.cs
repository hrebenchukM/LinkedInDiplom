using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.DataAccess;

// DbContext Content-модуля (posts, media, post_media).
public class ContentDbContext : DbContext
{
    public DbSet<Post> Posts { get; set; } = default!;

    public DbSet<Media> Media { get; set; } = default!;

    public DbSet<PostMedia> PostMedia { get; set; } = default!;

    public ContentDbContext(DbContextOptions<ContentDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("content");

        builder.Entity<Post>(entity =>
        {
            entity.ToTable("posts");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("post_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Content)
                .HasColumnName("content")
                .IsRequired();

            entity.Property(e => e.Visibility)
                .HasColumnName("visibility")
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.ReactionCount)
                .HasColumnName("reaction_count")
                .HasDefaultValue(0);

            entity.Property(e => e.CommentCount)
                .HasColumnName("comment_count")
                .HasDefaultValue(0);

            entity.Property(e => e.RepostCount)
                .HasColumnName("repost_count")
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.EditedAt)
                .HasColumnName("edited_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.UserId, e.DeletedAt })
                .HasDatabaseName("IX_posts_user_id_deleted_at");

            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_posts_created_at");
        });

        builder.Entity<Media>(entity =>
        {
            entity.ToTable("media");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("media_id");

            entity.Property(e => e.Url)
                .HasColumnName("url")
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(e => e.Type)
                .HasColumnName("type")
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.HasIndex(e => e.Type)
                .HasDatabaseName("IX_media_type");
        });

        builder.Entity<PostMedia>(entity =>
        {
            entity.ToTable("post_media");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("post_media_id");

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.MediaId)
                .HasColumnName("media_id")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_post_media_post_id");

            entity.HasIndex(e => e.MediaId)
                .HasDatabaseName("IX_post_media_media_id");

            entity.HasIndex(e => new { e.PostId, e.MediaId })
                .IsUnique()
                .HasDatabaseName("IX_post_media_post_id_media_id");
        });
    }
}
