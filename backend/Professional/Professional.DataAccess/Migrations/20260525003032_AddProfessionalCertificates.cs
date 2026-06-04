using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Professional.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfessionalCertificates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "certificates",
                schema: "professional",
                columns: table => new
                {
                    certificate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    academy_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    download_ref = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    issue_date = table.Column<DateOnly>(type: "date", nullable: false),
                    expiry_date = table.Column<DateOnly>(type: "date", nullable: true),
                    accreditation_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    organization_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_certificates", x => x.certificate_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_certificates_academy_id",
                schema: "professional",
                table: "certificates",
                column: "academy_id");

            migrationBuilder.CreateIndex(
                name: "IX_certificates_user_id",
                schema: "professional",
                table: "certificates",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "certificates",
                schema: "professional");
        }
    }
}
