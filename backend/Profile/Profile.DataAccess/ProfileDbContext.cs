using Microsoft.EntityFrameworkCore;
using Profile.DataAccess.Entities;

namespace Profile.DataAccess;

// Где хранить профили пользователей = менеджер работы с БД Profile-модуля
public class ProfileDbContext : DbContext
{
    public DbSet<UserProfile> UserProfiles { get; set; } = default!;

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
    }
}