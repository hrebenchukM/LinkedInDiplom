using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.DataAccess;

// DbContext Content-модуля (posts, media, comments, reactions, hashtags, saved, reposts, views, mentions).
public class ContentDbContext : DbContext
{
    public DbSet<Post> Posts { get; set; } = default!;

    public DbSet<Media> Media { get; set; } = default!;

    public DbSet<PostMedia> PostMedia { get; set; } = default!;

    public DbSet<Comment> Comments { get; set; } = default!;

    public DbSet<Reaction> Reactions { get; set; } = default!;

    public DbSet<Hashtag> Hashtags { get; set; } = default!;

    public DbSet<PostHashtag> PostHashtags { get; set; } = default!;

    public DbSet<UserHashtagFollow> UserHashtagFollows { get; set; } = default!;

    public DbSet<SavedPost> SavedPosts { get; set; } = default!;

    public DbSet<Repost> Reposts { get; set; } = default!;

    public DbSet<PostView> PostViews { get; set; } = default!;

    public DbSet<Mention> Mentions { get; set; } = default!;

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

        builder.Entity<Comment>(entity =>
        {
            entity.ToTable("comments");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("comment_id");

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.ParentCommentId)
                .HasColumnName("parent_comment_id");

            entity.Property(e => e.Content)
                .HasColumnName("content")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_comments_post_id");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_comments_user_id");

            entity.HasIndex(e => e.ParentCommentId)
                .HasDatabaseName("IX_comments_parent_comment_id");
        });

        builder.Entity<Reaction>(entity =>
        {
            entity.ToTable("reactions");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("reaction_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.ReactionType)
                .HasColumnName("reaction_type")
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_reactions_post_id");

            entity.HasIndex(e => new { e.UserId, e.PostId })
                .IsUnique()
                .HasDatabaseName("IX_reactions_user_id_post_id");
        });

        builder.Entity<Hashtag>(entity =>
        {
            entity.ToTable("hashtags");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("hashtag_id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.HasIndex(e => e.Name)
                .IsUnique()
                .HasDatabaseName("IX_hashtags_name");
        });

        builder.Entity<PostHashtag>(entity =>
        {
            entity.ToTable("post_hashtags");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("post_hashtag_id");

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.HashtagId)
                .HasColumnName("hashtag_id")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_post_hashtags_post_id");

            entity.HasIndex(e => e.HashtagId)
                .HasDatabaseName("IX_post_hashtags_hashtag_id");

            entity.HasIndex(e => new { e.PostId, e.HashtagId })
                .IsUnique()
                .HasDatabaseName("IX_post_hashtags_post_id_hashtag_id");
        });

        builder.Entity<UserHashtagFollow>(entity =>
        {
            entity.ToTable("user_hashtag_follows");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("follow_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.HashtagId)
                .HasColumnName("hashtag_id")
                .IsRequired();

            entity.Property(e => e.FollowedAt)
                .HasColumnName("followed_at");

            entity.Property(e => e.UnfollowedAt)
                .HasColumnName("unfollowed_at");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_user_hashtag_follows_user_id");

            entity.HasIndex(e => e.HashtagId)
                .HasDatabaseName("IX_user_hashtag_follows_hashtag_id");

            entity.HasIndex(e => new { e.UserId, e.HashtagId })
                .IsUnique()
                .HasDatabaseName("IX_user_hashtag_follows_user_id_hashtag_id");
        });

        builder.Entity<SavedPost>(entity =>
        {
            entity.ToTable("saved_posts");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("saved_post_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.SavedAt)
                .HasColumnName("saved_at");

            entity.Property(e => e.UnsavedAt)
                .HasColumnName("unsaved_at");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_saved_posts_user_id");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_saved_posts_post_id");

            entity.HasIndex(e => new { e.UserId, e.PostId })
                .IsUnique()
                .HasDatabaseName("IX_saved_posts_user_id_post_id");
        });

        builder.Entity<Repost>(entity =>
        {
            entity.ToTable("reposts");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("repost_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.OriginalPostId)
                .HasColumnName("original_post_id")
                .IsRequired();

            entity.Property(e => e.RepostedAt)
                .HasColumnName("reposted_at");

            entity.Property(e => e.RemovedAt)
                .HasColumnName("removed_at");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_reposts_user_id");

            entity.HasIndex(e => e.OriginalPostId)
                .HasDatabaseName("IX_reposts_original_post_id");

            entity.HasIndex(e => new { e.UserId, e.OriginalPostId })
                .IsUnique()
                .HasDatabaseName("IX_reposts_user_id_original_post_id");
        });

        builder.Entity<PostView>(entity =>
        {
            entity.ToTable("post_views");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("post_view_id");

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.ViewerUserId)
                .HasColumnName("viewer_user_id");

            entity.Property(e => e.ViewerIp)
                .HasColumnName("viewer_ip")
                .IsRequired()
                .HasMaxLength(45);

            entity.Property(e => e.ViewerUserAgent)
                .HasColumnName("viewer_user_agent")
                .HasMaxLength(500);

            entity.Property(e => e.Source)
                .HasColumnName("source")
                .HasMaxLength(100);

            entity.Property(e => e.ViewedAt)
                .HasColumnName("viewed_at");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_post_views_post_id");

            entity.HasIndex(e => new { e.PostId, e.ViewedAt })
                .HasDatabaseName("IX_post_views_post_id_viewed_at");
        });

        builder.Entity<Mention>(entity =>
        {
            entity.ToTable("mentions");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("mention_id");

            entity.Property(e => e.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            entity.Property(e => e.MentionedUserId)
                .HasColumnName("mentioned_user_id")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.PostId)
                .HasDatabaseName("IX_mentions_post_id");

            entity.HasIndex(e => e.MentionedUserId)
                .HasDatabaseName("IX_mentions_mentioned_user_id");

            entity.HasIndex(e => new { e.PostId, e.MentionedUserId })
                .IsUnique()
                .HasDatabaseName("IX_mentions_post_id_mentioned_user_id");
        });
    }
}
