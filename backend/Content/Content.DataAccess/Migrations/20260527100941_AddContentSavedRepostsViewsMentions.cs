using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Content.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContentSavedRepostsViewsMentions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "mentions",
                schema: "content",
                columns: table => new
                {
                    mention_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mentioned_user_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mentions", x => x.mention_id);
                });

            migrationBuilder.CreateTable(
                name: "post_views",
                schema: "content",
                columns: table => new
                {
                    post_view_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    viewer_user_id = table.Column<string>(type: "text", nullable: true),
                    viewer_ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    viewer_user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    viewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_views", x => x.post_view_id);
                });

            migrationBuilder.CreateTable(
                name: "reposts",
                schema: "content",
                columns: table => new
                {
                    repost_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    original_post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reposted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    removed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reposts", x => x.repost_id);
                });

            migrationBuilder.CreateTable(
                name: "saved_posts",
                schema: "content",
                columns: table => new
                {
                    saved_post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    saved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    unsaved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_saved_posts", x => x.saved_post_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_mentions_mentioned_user_id",
                schema: "content",
                table: "mentions",
                column: "mentioned_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_mentions_post_id",
                schema: "content",
                table: "mentions",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_mentions_post_id_mentioned_user_id",
                schema: "content",
                table: "mentions",
                columns: new[] { "post_id", "mentioned_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_views_post_id",
                schema: "content",
                table: "post_views",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_views_post_id_viewed_at",
                schema: "content",
                table: "post_views",
                columns: new[] { "post_id", "viewed_at" });

            migrationBuilder.CreateIndex(
                name: "IX_reposts_original_post_id",
                schema: "content",
                table: "reposts",
                column: "original_post_id");

            migrationBuilder.CreateIndex(
                name: "IX_reposts_user_id",
                schema: "content",
                table: "reposts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_reposts_user_id_original_post_id",
                schema: "content",
                table: "reposts",
                columns: new[] { "user_id", "original_post_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_saved_posts_post_id",
                schema: "content",
                table: "saved_posts",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_saved_posts_user_id",
                schema: "content",
                table: "saved_posts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_saved_posts_user_id_post_id",
                schema: "content",
                table: "saved_posts",
                columns: new[] { "user_id", "post_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mentions",
                schema: "content");

            migrationBuilder.DropTable(
                name: "post_views",
                schema: "content");

            migrationBuilder.DropTable(
                name: "reposts",
                schema: "content");

            migrationBuilder.DropTable(
                name: "saved_posts",
                schema: "content");
        }
    }
}
