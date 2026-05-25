using Microsoft.EntityFrameworkCore;
using Profile.DataAccess.Entities;

namespace Profile.DataAccess;

// Где хранить профили пользователей = менеджер работы с БД Profile-модуля
public class ProfileDbContext : DbContext
{
    public DbSet<UserProfile> UserProfiles { get; set; } = default!;
    public DbSet<MessageSettings> MessageSettings { get; set; } = default!;
    public DbSet<ProfileView> ProfileViews { get; set; } = default!;

    public ProfileDbContext(DbContextOptions<ProfileDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("profile");

        builder.Entity<UserProfile>(entity =>
        {
            entity.ToTable("user_profiles");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("profile_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.HasIndex(e => e.UserId)
                .IsUnique();

            entity.Property(e => e.FirstName)
                .HasColumnName("first_name")
                .HasMaxLength(100);

            entity.Property(e => e.LastName)
                .HasColumnName("last_name")
                .HasMaxLength(100);

            entity.Property(e => e.AvatarUrl)
                .HasColumnName("avatar_url")
                .HasMaxLength(500);

            entity.Property(e => e.HeaderUrl)
                .HasColumnName("header_url")
                .HasMaxLength(500);

            entity.Property(e => e.ProfileTitle)
                .HasColumnName("profile_title")
                .HasMaxLength(200);

            entity.Property(e => e.Headline)
                .HasColumnName("headline")
                .HasMaxLength(300);

            entity.Property(e => e.GenInfo)
                .HasColumnName("gen_info");

            entity.Property(e => e.University)
                .HasColumnName("university")
                .HasMaxLength(200);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(200);

            entity.Property(e => e.PortfolioUrl)
                .HasColumnName("portfolio_url")
                .HasMaxLength(500);

            entity.Property(e => e.IsCompany)
                .HasColumnName("is_company");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");
        });

        builder.Entity<MessageSettings>(entity =>
        {
            entity.ToTable("message_settings");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("ms_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.OfficeAbsenceEnabled)
                .HasColumnName("office_absence_enabled")
                .HasDefaultValue(false);

            entity.Property(e => e.OfficeAbsenceMessage)
                .HasColumnName("office_absence_message");

            entity.Property(e => e.NotificationsEnabled)
                .HasColumnName("notifications_enabled")
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.HasIndex(e => e.UserId)
                .IsUnique()
                .HasDatabaseName("IX_message_settings_user_id");
        });

        builder.Entity<ProfileView>(entity =>
        {
            entity.ToTable("profile_views");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("pv_id");

            entity.Property(e => e.ProfileOwnerId)
                .HasColumnName("profile_owner_id")
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

            entity.HasIndex(e => e.ProfileOwnerId)
                .HasDatabaseName("IX_profile_views_profile_owner_id");

            entity.HasIndex(e => new { e.ProfileOwnerId, e.ViewedAt })
                .HasDatabaseName("IX_profile_views_profile_owner_id_viewed_at");
        });
    }
}