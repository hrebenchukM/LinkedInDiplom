using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Network.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "network");

            migrationBuilder.CreateTable(
                name: "blocked_users",
                schema: "network",
                columns: table => new
                {
                    block_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    blocked_user_id = table.Column<string>(type: "text", nullable: false),
                    blocked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    unblocked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_blocked_users", x => x.block_id);
                });

            migrationBuilder.CreateTable(
                name: "contacts",
                schema: "network",
                columns: table => new
                {
                    contact_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requester_id = table.Column<string>(type: "text", nullable: false),
                    receiver_id = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status_changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contacts", x => x.contact_id);
                });

            migrationBuilder.CreateTable(
                name: "follows",
                schema: "network",
                columns: table => new
                {
                    follow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    follower_id = table.Column<string>(type: "text", nullable: false),
                    following_id = table.Column<string>(type: "text", nullable: false),
                    followed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    unfollowed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_follows", x => x.follow_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_blocked_users_user_id",
                schema: "network",
                table: "blocked_users",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_blocked_users_user_id_blocked_user_id",
                schema: "network",
                table: "blocked_users",
                columns: new[] { "user_id", "blocked_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_contacts_receiver_id",
                schema: "network",
                table: "contacts",
                column: "receiver_id");

            migrationBuilder.CreateIndex(
                name: "IX_contacts_requester_id",
                schema: "network",
                table: "contacts",
                column: "requester_id");

            migrationBuilder.CreateIndex(
                name: "IX_contacts_requester_id_receiver_id",
                schema: "network",
                table: "contacts",
                columns: new[] { "requester_id", "receiver_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_follows_follower_id",
                schema: "network",
                table: "follows",
                column: "follower_id");

            migrationBuilder.CreateIndex(
                name: "IX_follows_follower_id_following_id",
                schema: "network",
                table: "follows",
                columns: new[] { "follower_id", "following_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_follows_following_id",
                schema: "network",
                table: "follows",
                column: "following_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "blocked_users",
                schema: "network");

            migrationBuilder.DropTable(
                name: "contacts",
                schema: "network");

            migrationBuilder.DropTable(
                name: "follows",
                schema: "network");
        }
    }
}
