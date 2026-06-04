using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Content.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContentModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "content");

            migrationBuilder.CreateTable(
                name: "media",
                schema: "content",
                columns: table => new
                {
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_media", x => x.media_id);
                });

            migrationBuilder.CreateTable(
                name: "post_media",
                schema: "content",
                columns: table => new
                {
                    post_media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_media", x => x.post_media_id);
                });

            migrationBuilder.CreateTable(
                name: "posts",
                schema: "content",
                columns: table => new
                {
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    visibility = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    reaction_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    comment_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    repost_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    edited_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_posts", x => x.post_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_media_type",
                schema: "content",
                table: "media",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "IX_post_media_media_id",
                schema: "content",
                table: "post_media",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_media_post_id",
                schema: "content",
                table: "post_media",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_media_post_id_media_id",
                schema: "content",
                table: "post_media",
                columns: new[] { "post_id", "media_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_posts_created_at",
                schema: "content",
                table: "posts",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_posts_user_id_deleted_at",
                schema: "content",
                table: "posts",
                columns: new[] { "user_id", "deleted_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "post_media",
                schema: "content");

            migrationBuilder.DropTable(
                name: "media",
                schema: "content");

            migrationBuilder.DropTable(
                name: "posts",
                schema: "content");
        }
    }
}
