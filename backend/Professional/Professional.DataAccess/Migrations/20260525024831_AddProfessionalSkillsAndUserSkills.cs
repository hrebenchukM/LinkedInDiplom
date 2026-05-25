using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Professional.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfessionalSkillsAndUserSkills : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "skills",
                schema: "professional",
                columns: table => new
                {
                    skill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_skills", x => x.skill_id);
                });

            migrationBuilder.CreateTable(
                name: "user_skills",
                schema: "professional",
                columns: table => new
                {
                    user_skill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    skill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_main = table.Column<bool>(type: "boolean", nullable: false),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_skills", x => x.user_skill_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_skills_name",
                schema: "professional",
                table: "skills",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_user_skills_skill_id",
                schema: "professional",
                table: "user_skills",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_skills_user_id",
                schema: "professional",
                table: "user_skills",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_skills_user_id_skill_id",
                schema: "professional",
                table: "user_skills",
                columns: new[] { "user_id", "skill_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "skills",
                schema: "professional");

            migrationBuilder.DropTable(
                name: "user_skills",
                schema: "professional");
        }
    }
}
