using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Identity.DataAccess;

public class IdentityDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) 
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure schema for Identity module
        builder.HasDefaultSchema("identity");

        // Configure RefreshToken entity
        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.UserId).IsRequired();
            entity.HasIndex(e => e.Token).IsUnique();
            
            // Configure relationship
            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
