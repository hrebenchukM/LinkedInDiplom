using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Messaging.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddMessagingModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "messaging");

            migrationBuilder.CreateTable(
                name: "chat_members",
                schema: "messaging",
                columns: table => new
                {
                    chat_member_id = table.Column<Guid>(type: "uuid", nullable: false),
                    chat_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    folder = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    left_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_members", x => x.chat_member_id);
                });

            migrationBuilder.CreateTable(
                name: "chats",
                schema: "messaging",
                columns: table => new
                {
                    chat_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chats", x => x.chat_id);
                });

            migrationBuilder.CreateTable(
                name: "message_media",
                schema: "messaging",
                columns: table => new
                {
                    message_media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    media_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message_media", x => x.message_media_id);
                });

            migrationBuilder.CreateTable(
                name: "message_reads",
                schema: "messaging",
                columns: table => new
                {
                    message_read_id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message_reads", x => x.message_read_id);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                schema: "messaging",
                columns: table => new
                {
                    message_id = table.Column<Guid>(type: "uuid", nullable: false),
                    chat_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    edited_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messages", x => x.message_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_chat_members_chat_id",
                schema: "messaging",
                table: "chat_members",
                column: "chat_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_members_chat_id_user_id",
                schema: "messaging",
                table: "chat_members",
                columns: new[] { "chat_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_chat_members_user_id",
                schema: "messaging",
                table: "chat_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_chats_created_by",
                schema: "messaging",
                table: "chats",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_message_media_message_id",
                schema: "messaging",
                table: "message_media",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "IX_message_reads_message_id",
                schema: "messaging",
                table: "message_reads",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "IX_message_reads_message_id_user_id",
                schema: "messaging",
                table: "message_reads",
                columns: new[] { "message_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_message_reads_user_id",
                schema: "messaging",
                table: "message_reads",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_messages_chat_id_created_at",
                schema: "messaging",
                table: "messages",
                columns: new[] { "chat_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_messages_sender_id",
                schema: "messaging",
                table: "messages",
                column: "sender_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "message_media",
                schema: "messaging");

            migrationBuilder.DropTable(
                name: "message_reads",
                schema: "messaging");

            migrationBuilder.DropTable(
                name: "messages",
                schema: "messaging");

            migrationBuilder.DropTable(
                name: "chat_members",
                schema: "messaging");

            migrationBuilder.DropTable(
                name: "chats",
                schema: "messaging");
        }
    }
}
