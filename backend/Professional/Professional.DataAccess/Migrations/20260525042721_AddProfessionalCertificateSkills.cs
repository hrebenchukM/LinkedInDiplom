using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Professional.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfessionalCertificateSkills : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "certificate_skills",
                schema: "professional",
                columns: table => new
                {
                    certificate_skill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    certificate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    skill_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_certificate_skills", x => x.certificate_skill_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_certificate_skills_certificate_id",
                schema: "professional",
                table: "certificate_skills",
                column: "certificate_id");

            migrationBuilder.CreateIndex(
                name: "IX_certificate_skills_certificate_id_skill_id",
                schema: "professional",
                table: "certificate_skills",
                columns: new[] { "certificate_id", "skill_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_certificate_skills_skill_id",
                schema: "professional",
                table: "certificate_skills",
                column: "skill_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "certificate_skills",
                schema: "professional");
        }
    }
}
