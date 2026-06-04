using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Professional.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfessionalRecommendedSkillsByPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "recommended_skills_by_position",
                schema: "professional",
                columns: table => new
                {
                    rsp_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    skill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recommended_skills_by_position", x => x.rsp_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_recommended_skills_by_position_position",
                schema: "professional",
                table: "recommended_skills_by_position",
                column: "position");

            migrationBuilder.CreateIndex(
                name: "IX_recommended_skills_by_position_position_skill_id",
                schema: "professional",
                table: "recommended_skills_by_position",
                columns: new[] { "position", "skill_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_recommended_skills_by_position_skill_id",
                schema: "professional",
                table: "recommended_skills_by_position",
                column: "skill_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recommended_skills_by_position",
                schema: "professional");
        }
    }
}
