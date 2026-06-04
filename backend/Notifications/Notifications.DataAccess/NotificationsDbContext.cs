using Microsoft.EntityFrameworkCore;
using Notifications.DataAccess.Entities;

namespace Notifications.DataAccess;

public class NotificationsDbContext : DbContext
{
    public DbSet<Notification> Notifications { get; set; } = default!;
    public DbSet<UserActivity> UserActivities { get; set; } = default!;

    public NotificationsDbContext(DbContextOptions<NotificationsDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("notifications");

        builder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("notification_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.ActorUserId)
                .HasColumnName("actor_user_id");

            entity.Property(e => e.Type)
                .HasColumnName("type")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(250)
                .IsRequired();

            entity.Property(e => e.Body)
                .HasColumnName("body");

            entity.Property(e => e.EntityType)
                .HasColumnName("entity_type")
                .HasMaxLength(50);

            entity.Property(e => e.EntityId)
                .HasColumnName("entity_id");

            entity.Property(e => e.IsRead)
                .HasColumnName("is_read")
                .HasDefaultValue(false)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.UserId, e.CreatedAt })
                .HasDatabaseName("IX_notifications_user_id_created_at");

            entity.HasIndex(e => new { e.UserId, e.IsRead })
                .HasDatabaseName("IX_notifications_user_id_is_read");
        });

        builder.Entity<UserActivity>(entity =>
        {
            entity.ToTable("user_activity");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("activity_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Action)
                .HasColumnName("action")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.EntityType)
                .HasColumnName("entity_type")
                .HasMaxLength(50);

            entity.Property(e => e.EntityId)
                .HasColumnName("entity_id");

            entity.Property(e => e.Meta)
                .HasColumnName("meta")
                .HasColumnType("jsonb");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.HasIndex(e => new { e.UserId, e.CreatedAt })
                .HasDatabaseName("IX_user_activity_user_id_created_at");
        });
    }
}
