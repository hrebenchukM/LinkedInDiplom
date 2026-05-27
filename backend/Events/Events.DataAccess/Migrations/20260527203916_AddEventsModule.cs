using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Events.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddEventsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "events");

            migrationBuilder.CreateTable(
                name: "event_attendees",
                schema: "events",
                columns: table => new
                {
                    event_attendee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_attendees", x => x.event_attendee_id);
                });

            migrationBuilder.CreateTable(
                name: "event_schedule",
                schema: "events",
                columns: table => new
                {
                    schedule_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    time_label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    speaker_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_schedule", x => x.schedule_id);
                });

            migrationBuilder.CreateTable(
                name: "event_speaker_map",
                schema: "events",
                columns: table => new
                {
                    event_speaker_map_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    speaker_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_index = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_speaker_map", x => x.event_speaker_map_id);
                });

            migrationBuilder.CreateTable(
                name: "event_speakers",
                schema: "events",
                columns: table => new
                {
                    speaker_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    avatar_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_speakers", x => x.speaker_id);
                });

            migrationBuilder.CreateTable(
                name: "events",
                schema: "events",
                columns: table => new
                {
                    event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    organizer_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    organizer_id = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    cover_image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    location = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    is_online = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    external_link = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    visibility = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "public"),
                    allow_comments = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    start_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.event_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_event_attendees_event_id_status",
                schema: "events",
                table: "event_attendees",
                columns: new[] { "event_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_event_attendees_event_id_user_id",
                schema: "events",
                table: "event_attendees",
                columns: new[] { "event_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_event_attendees_user_id",
                schema: "events",
                table: "event_attendees",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_event_schedule_event_id_order_index",
                schema: "events",
                table: "event_schedule",
                columns: new[] { "event_id", "order_index" });

            migrationBuilder.CreateIndex(
                name: "IX_event_speaker_map_event_id",
                schema: "events",
                table: "event_speaker_map",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_event_speaker_map_event_id_speaker_id",
                schema: "events",
                table: "event_speaker_map",
                columns: new[] { "event_id", "speaker_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_event_speaker_map_speaker_id",
                schema: "events",
                table: "event_speaker_map",
                column: "speaker_id");

            migrationBuilder.CreateIndex(
                name: "IX_events_organizer_id_created_at",
                schema: "events",
                table: "events",
                columns: new[] { "organizer_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_events_start_at",
                schema: "events",
                table: "events",
                column: "start_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "event_speaker_map",
                schema: "events");

            migrationBuilder.DropTable(
                name: "event_schedule",
                schema: "events");

            migrationBuilder.DropTable(
                name: "event_attendees",
                schema: "events");

            migrationBuilder.DropTable(
                name: "event_speakers",
                schema: "events");

            migrationBuilder.DropTable(
                name: "events",
                schema: "events");
        }
    }
}
