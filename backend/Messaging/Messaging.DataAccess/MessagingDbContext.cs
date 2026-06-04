using Messaging.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Messaging.DataAccess;

// DbContext Messaging-модуля (chats, members, messages, reads, media).
public class MessagingDbContext : DbContext
{
    public DbSet<Chat> Chats { get; set; } = default!;
    public DbSet<ChatMember> ChatMembers { get; set; } = default!;
    public DbSet<Message> Messages { get; set; } = default!;
    public DbSet<MessageRead> MessageReads { get; set; } = default!;
    public DbSet<MessageMedia> MessageMedia { get; set; } = default!;

    public MessagingDbContext(DbContextOptions<MessagingDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("messaging");

        builder.Entity<Chat>(entity =>
        {
            entity.ToTable("chats");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("chat_id");

            entity.Property(e => e.CreatedBy)
                .HasColumnName("created_by")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.CreatedBy)
                .HasDatabaseName("IX_chats_created_by");
        });

        builder.Entity<ChatMember>(entity =>
        {
            entity.ToTable("chat_members");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("chat_member_id");

            entity.Property(e => e.ChatId)
                .HasColumnName("chat_id")
                .IsRequired();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Folder)
                .HasColumnName("folder")
                .HasMaxLength(50);

            entity.Property(e => e.JoinedAt)
                .HasColumnName("joined_at")
                .IsRequired();

            entity.Property(e => e.LeftAt)
                .HasColumnName("left_at");

            entity.HasIndex(e => e.ChatId)
                .HasDatabaseName("IX_chat_members_chat_id");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_chat_members_user_id");

            entity.HasIndex(e => new { e.ChatId, e.UserId })
                .IsUnique()
                .HasDatabaseName("IX_chat_members_chat_id_user_id");
        });

        builder.Entity<Message>(entity =>
        {
            entity.ToTable("messages");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("message_id");

            entity.Property(e => e.ChatId)
                .HasColumnName("chat_id")
                .IsRequired();

            entity.Property(e => e.SenderId)
                .HasColumnName("sender_id")
                .IsRequired();

            entity.Property(e => e.Content)
                .HasColumnName("content")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.EditedAt)
                .HasColumnName("edited_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.ChatId, e.CreatedAt })
                .HasDatabaseName("IX_messages_chat_id_created_at");

            entity.HasIndex(e => e.SenderId)
                .HasDatabaseName("IX_messages_sender_id");
        });

        builder.Entity<MessageRead>(entity =>
        {
            entity.ToTable("message_reads");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("message_read_id");

            entity.Property(e => e.MessageId)
                .HasColumnName("message_id")
                .IsRequired();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.ReadAt)
                .HasColumnName("read_at")
                .IsRequired();

            entity.HasIndex(e => e.MessageId)
                .HasDatabaseName("IX_message_reads_message_id");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_message_reads_user_id");

            entity.HasIndex(e => new { e.MessageId, e.UserId })
                .IsUnique()
                .HasDatabaseName("IX_message_reads_message_id_user_id");
        });

        builder.Entity<MessageMedia>(entity =>
        {
            entity.ToTable("message_media");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("message_media_id");

            entity.Property(e => e.MessageId)
                .HasColumnName("message_id")
                .IsRequired();

            entity.Property(e => e.MediaUrl)
                .HasColumnName("media_url")
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(e => e.MediaType)
                .HasColumnName("media_type")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.HasIndex(e => e.MessageId)
                .HasDatabaseName("IX_message_media_message_id");
        });
    }
}
