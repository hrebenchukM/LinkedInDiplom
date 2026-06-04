using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Profile.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileProfileViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "profile_views",
                schema: "profile",
                columns: table => new
                {
                    pv_id = table.Column<Guid>(type: "uuid", nullable: false),
                    profile_owner_id = table.Column<string>(type: "text", nullable: false),
                    viewer_user_id = table.Column<string>(type: "text", nullable: true),
                    viewer_ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    viewer_user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    viewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profile_views", x => x.pv_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_profile_views_profile_owner_id",
                schema: "profile",
                table: "profile_views",
                column: "profile_owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_profile_views_profile_owner_id_viewed_at",
                schema: "profile",
                table: "profile_views",
                columns: new[] { "profile_owner_id", "viewed_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "profile_views",
                schema: "profile");
        }
    }
}
