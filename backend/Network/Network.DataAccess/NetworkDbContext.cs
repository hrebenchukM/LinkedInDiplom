using Microsoft.EntityFrameworkCore;
using Network.DataAccess.Entities;

namespace Network.DataAccess;

// DbContext Network-модуля (социальный граф: contacts, follows, blocked_users, groups).
public class NetworkDbContext : DbContext
{
    public DbSet<Contact> Contacts { get; set; } = default!;
    public DbSet<Follow> Follows { get; set; } = default!;
    public DbSet<BlockedUser> BlockedUsers { get; set; } = default!;
    public DbSet<UserGroup> UserGroups { get; set; } = default!;
    public DbSet<GroupMember> GroupMembers { get; set; } = default!;

    public NetworkDbContext(DbContextOptions<NetworkDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("network");

        builder.Entity<Contact>(entity =>
        {
            entity.ToTable("contacts");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("contact_id");

            entity.Property(e => e.RequesterId)
                .HasColumnName("requester_id")
                .IsRequired();

            entity.Property(e => e.ReceiverId)
                .HasColumnName("receiver_id")
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.RequestedAt)
                .HasColumnName("requested_at");

            entity.Property(e => e.RespondedAt)
                .HasColumnName("responded_at");

            entity.Property(e => e.StatusChangedAt)
                .HasColumnName("status_changed_at");

            entity.HasIndex(e => e.RequesterId)
                .HasDatabaseName("IX_contacts_requester_id");

            entity.HasIndex(e => e.ReceiverId)
                .HasDatabaseName("IX_contacts_receiver_id");

            entity.HasIndex(e => new { e.RequesterId, e.ReceiverId })
                .IsUnique()
                .HasDatabaseName("IX_contacts_requester_id_receiver_id");
        });

        builder.Entity<Follow>(entity =>
        {
            entity.ToTable("follows");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("follow_id");

            entity.Property(e => e.FollowerId)
                .HasColumnName("follower_id")
                .IsRequired();

            entity.Property(e => e.FollowingId)
                .HasColumnName("following_id")
                .IsRequired();

            entity.Property(e => e.FollowedAt)
                .HasColumnName("followed_at");

            entity.Property(e => e.UnfollowedAt)
                .HasColumnName("unfollowed_at");

            entity.HasIndex(e => e.FollowerId)
                .HasDatabaseName("IX_follows_follower_id");

            entity.HasIndex(e => e.FollowingId)
                .HasDatabaseName("IX_follows_following_id");

            entity.HasIndex(e => new { e.FollowerId, e.FollowingId })
                .IsUnique()
                .HasDatabaseName("IX_follows_follower_id_following_id");
        });

        builder.Entity<BlockedUser>(entity =>
        {
            entity.ToTable("blocked_users");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("block_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.BlockedUserId)
                .HasColumnName("blocked_user_id")
                .IsRequired();

            entity.Property(e => e.BlockedAt)
                .HasColumnName("blocked_at");

            entity.Property(e => e.UnblockedAt)
                .HasColumnName("unblocked_at");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_blocked_users_user_id");

            entity.HasIndex(e => new { e.UserId, e.BlockedUserId })
                .IsUnique()
                .HasDatabaseName("IX_blocked_users_user_id_blocked_user_id");
        });

        builder.Entity<UserGroup>(entity =>
        {
            entity.ToTable("user_groups");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("group_id");

            entity.Property(e => e.OwnerId)
                .HasColumnName("owner_id")
                .IsRequired();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.Property(e => e.AvatarUrl)
                .HasColumnName("avatar_url")
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.OwnerId)
                .HasDatabaseName("IX_user_groups_owner_id");
        });

        builder.Entity<GroupMember>(entity =>
        {
            entity.ToTable("group_members");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("group_member_id");

            entity.Property(e => e.GroupId)
                .HasColumnName("group_id")
                .IsRequired();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Role)
                .HasColumnName("role")
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.GroupId)
                .HasDatabaseName("IX_group_members_group_id");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_group_members_user_id");

            entity.HasIndex(e => new { e.GroupId, e.UserId })
                .IsUnique()
                .HasDatabaseName("IX_group_members_group_id_user_id");
        });
    }
}
