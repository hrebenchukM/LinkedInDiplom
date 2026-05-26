using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Network.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "group_members",
                schema: "network",
                columns: table => new
                {
                    group_member_id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_group_members", x => x.group_member_id);
                });

            migrationBuilder.CreateTable(
                name: "user_groups",
                schema: "network",
                columns: table => new
                {
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    avatar_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_groups", x => x.group_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_group_members_group_id",
                schema: "network",
                table: "group_members",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_group_members_group_id_user_id",
                schema: "network",
                table: "group_members",
                columns: new[] { "group_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_group_members_user_id",
                schema: "network",
                table: "group_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_groups_owner_id",
                schema: "network",
                table: "user_groups",
                column: "owner_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "group_members",
                schema: "network");

            migrationBuilder.DropTable(
                name: "user_groups",
                schema: "network");
        }
    }
}
