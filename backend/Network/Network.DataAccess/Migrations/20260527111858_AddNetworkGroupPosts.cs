using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Network.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkGroupPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "group_posts",
                schema: "network",
                columns: table => new
                {
                    group_post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_group_posts", x => x.group_post_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_group_posts_group_id",
                schema: "network",
                table: "group_posts",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_group_posts_group_id_post_id",
                schema: "network",
                table: "group_posts",
                columns: new[] { "group_id", "post_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_group_posts_post_id",
                schema: "network",
                table: "group_posts",
                column: "post_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "group_posts",
                schema: "network");
        }
    }
}
