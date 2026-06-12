using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Network.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "page_admins",
                schema: "network",
                columns: table => new
                {
                    page_admin_id = table.Column<Guid>(type: "uuid", nullable: false),
                    page_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_page_admins", x => x.page_admin_id);
                });

            migrationBuilder.CreateTable(
                name: "page_followers",
                schema: "network",
                columns: table => new
                {
                    page_follower_id = table.Column<Guid>(type: "uuid", nullable: false),
                    page_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    followed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    unfollowed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_page_followers", x => x.page_follower_id);
                });

            migrationBuilder.CreateTable(
                name: "pages",
                schema: "network",
                columns: table => new
                {
                    page_id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    logo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pages", x => x.page_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_page_admins_page_id",
                schema: "network",
                table: "page_admins",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "IX_page_admins_page_id_user_id",
                schema: "network",
                table: "page_admins",
                columns: new[] { "page_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_page_admins_user_id",
                schema: "network",
                table: "page_admins",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_page_followers_page_id",
                schema: "network",
                table: "page_followers",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "IX_page_followers_page_id_user_id",
                schema: "network",
                table: "page_followers",
                columns: new[] { "page_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_page_followers_user_id",
                schema: "network",
                table: "page_followers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_pages_owner_id",
                schema: "network",
                table: "pages",
                column: "owner_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "page_followers",
                schema: "network");

            migrationBuilder.DropTable(
                name: "page_admins",
                schema: "network");

            migrationBuilder.DropTable(
                name: "pages",
                schema: "network");
        }
    }
}
