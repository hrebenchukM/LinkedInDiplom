using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Content.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContentHashtagsAndFollows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hashtags",
                schema: "content",
                columns: table => new
                {
                    hashtag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hashtags", x => x.hashtag_id);
                });

            migrationBuilder.CreateTable(
                name: "post_hashtags",
                schema: "content",
                columns: table => new
                {
                    post_hashtag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hashtag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_hashtags", x => x.post_hashtag_id);
                });

            migrationBuilder.CreateTable(
                name: "user_hashtag_follows",
                schema: "content",
                columns: table => new
                {
                    follow_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    hashtag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    followed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    unfollowed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_hashtag_follows", x => x.follow_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_hashtags_name",
                schema: "content",
                table: "hashtags",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_hashtags_hashtag_id",
                schema: "content",
                table: "post_hashtags",
                column: "hashtag_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_hashtags_post_id",
                schema: "content",
                table: "post_hashtags",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_hashtags_post_id_hashtag_id",
                schema: "content",
                table: "post_hashtags",
                columns: new[] { "post_id", "hashtag_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_hashtag_follows_hashtag_id",
                schema: "content",
                table: "user_hashtag_follows",
                column: "hashtag_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_hashtag_follows_user_id",
                schema: "content",
                table: "user_hashtag_follows",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_hashtag_follows_user_id_hashtag_id",
                schema: "content",
                table: "user_hashtag_follows",
                columns: new[] { "user_id", "hashtag_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_hashtag_follows",
                schema: "content");

            migrationBuilder.DropTable(
                name: "post_hashtags",
                schema: "content");

            migrationBuilder.DropTable(
                name: "hashtags",
                schema: "content");
        }
    }
}
