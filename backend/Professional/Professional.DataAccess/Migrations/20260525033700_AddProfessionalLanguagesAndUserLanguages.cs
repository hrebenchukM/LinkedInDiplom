using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Professional.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfessionalLanguagesAndUserLanguages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "languages",
                schema: "professional",
                columns: table => new
                {
                    language_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_languages", x => x.language_id);
                });

            migrationBuilder.CreateTable(
                name: "user_languages",
                schema: "professional",
                columns: table => new
                {
                    user_language_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    language_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_languages", x => x.user_language_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_languages_name",
                schema: "professional",
                table: "languages",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_user_languages_language_id",
                schema: "professional",
                table: "user_languages",
                column: "language_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_languages_user_id",
                schema: "professional",
                table: "user_languages",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_languages_user_id_language_id",
                schema: "professional",
                table: "user_languages",
                columns: new[] { "user_id", "language_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "languages",
                schema: "professional");

            migrationBuilder.DropTable(
                name: "user_languages",
                schema: "professional");
        }
    }
}
