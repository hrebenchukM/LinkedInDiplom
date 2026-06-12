using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.DataAccess;

public class EventsDbContext : DbContext
{
    public DbSet<Event> Events { get; set; } = default!;
    public DbSet<EventAttendee> EventAttendees { get; set; } = default!;
    public DbSet<EventScheduleItem> EventSchedule { get; set; } = default!;
    public DbSet<EventSpeaker> EventSpeakers { get; set; } = default!;
    public DbSet<EventSpeakerMap> EventSpeakerMaps { get; set; } = default!;

    public EventsDbContext(DbContextOptions<EventsDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("events");

        builder.Entity<Event>(entity =>
        {
            entity.ToTable("events");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("event_id");

            entity.Property(e => e.OrganizerType)
                .HasColumnName("organizer_type")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.OrganizerId)
                .HasColumnName("organizer_id")
                .IsRequired();

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(250)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.Property(e => e.CoverImageUrl)
                .HasColumnName("cover_image_url")
                .HasMaxLength(500);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(250);

            entity.Property(e => e.IsOnline)
                .HasColumnName("is_online")
                .HasDefaultValue(false)
                .IsRequired();

            entity.Property(e => e.ExternalLink)
                .HasColumnName("external_link")
                .HasMaxLength(500);

            entity.Property(e => e.Timezone)
                .HasColumnName("timezone")
                .HasMaxLength(100);

            entity.Property(e => e.Visibility)
                .HasColumnName("visibility")
                .HasMaxLength(50)
                .HasDefaultValue("public")
                .IsRequired();

            entity.Property(e => e.AllowComments)
                .HasColumnName("allow_comments")
                .HasDefaultValue(true)
                .IsRequired();

            entity.Property(e => e.StartAt)
                .HasColumnName("start_at")
                .IsRequired();

            entity.Property(e => e.EndAt)
                .HasColumnName("end_at");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.OrganizerId, e.CreatedAt })
                .HasDatabaseName("IX_events_organizer_id_created_at");

            entity.HasIndex(e => e.StartAt)
                .HasDatabaseName("IX_events_start_at");
        });

        builder.Entity<EventAttendee>(entity =>
        {
            entity.ToTable("event_attendees");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("event_attendee_id");

            entity.Property(e => e.EventId)
                .HasColumnName("event_id")
                .IsRequired();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.JoinedAt)
                .HasColumnName("joined_at")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.EventId, e.Status })
                .HasDatabaseName("IX_event_attendees_event_id_status");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_event_attendees_user_id");

            entity.HasIndex(e => new { e.EventId, e.UserId })
                .IsUnique()
                .HasDatabaseName("IX_event_attendees_event_id_user_id");
        });

        builder.Entity<EventScheduleItem>(entity =>
        {
            entity.ToTable("event_schedule");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("schedule_id");

            entity.Property(e => e.EventId)
                .HasColumnName("event_id")
                .IsRequired();

            entity.Property(e => e.TimeLabel)
                .HasColumnName("time_label")
                .HasMaxLength(100);

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(250)
                .IsRequired();

            entity.Property(e => e.SpeakerName)
                .HasColumnName("speaker_name")
                .HasMaxLength(250);

            entity.Property(e => e.OrderIndex)
                .HasColumnName("order_index")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.HasIndex(e => new { e.EventId, e.OrderIndex })
                .HasDatabaseName("IX_event_schedule_event_id_order_index");
        });

        builder.Entity<EventSpeaker>(entity =>
        {
            entity.ToTable("event_speakers");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("speaker_id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(250)
                .IsRequired();

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(250);

            entity.Property(e => e.AvatarUrl)
                .HasColumnName("avatar_url")
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
        });

        builder.Entity<EventSpeakerMap>(entity =>
        {
            entity.ToTable("event_speaker_map");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("event_speaker_map_id");

            entity.Property(e => e.EventId)
                .HasColumnName("event_id")
                .IsRequired();

            entity.Property(e => e.SpeakerId)
                .HasColumnName("speaker_id")
                .IsRequired();

            entity.Property(e => e.OrderIndex)
                .HasColumnName("order_index")
                .IsRequired();

            entity.HasIndex(e => e.EventId)
                .HasDatabaseName("IX_event_speaker_map_event_id");

            entity.HasIndex(e => e.SpeakerId)
                .HasDatabaseName("IX_event_speaker_map_speaker_id");

            entity.HasIndex(e => new { e.EventId, e.SpeakerId })
                .IsUnique()
                .HasDatabaseName("IX_event_speaker_map_event_id_speaker_id");
        });
    }
}
