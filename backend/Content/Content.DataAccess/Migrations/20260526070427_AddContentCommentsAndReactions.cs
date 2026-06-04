using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Content.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContentCommentsAndReactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "comments",
                schema: "content",
                columns: table => new
                {
                    comment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    parent_comment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_comments", x => x.comment_id);
                });

            migrationBuilder.CreateTable(
                name: "reactions",
                schema: "content",
                columns: table => new
                {
                    reaction_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reaction_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reactions", x => x.reaction_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_comments_parent_comment_id",
                schema: "content",
                table: "comments",
                column: "parent_comment_id");

            migrationBuilder.CreateIndex(
                name: "IX_comments_post_id",
                schema: "content",
                table: "comments",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_comments_user_id",
                schema: "content",
                table: "comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_reactions_post_id",
                schema: "content",
                table: "reactions",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_reactions_user_id_post_id",
                schema: "content",
                table: "reactions",
                columns: new[] { "user_id", "post_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reactions",
                schema: "content");

            migrationBuilder.DropTable(
                name: "comments",
                schema: "content");
        }
    }
}
