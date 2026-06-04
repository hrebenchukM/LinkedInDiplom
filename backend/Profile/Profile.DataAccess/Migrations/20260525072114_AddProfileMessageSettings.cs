using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Profile.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileMessageSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "message_settings",
                schema: "profile",
                columns: table => new
                {
                    ms_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    office_absence_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    office_absence_message = table.Column<string>(type: "text", nullable: true),
                    notifications_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message_settings", x => x.ms_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_message_settings_user_id",
                schema: "profile",
                table: "message_settings",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "message_settings",
                schema: "profile");
        }
    }
}
