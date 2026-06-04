using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobs.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddJobsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "jobs");

            migrationBuilder.CreateTable(
                name: "job_applications",
                schema: "jobs",
                columns: table => new
                {
                    application_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vacancy_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    applied_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status_changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    withdrawn_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_applications", x => x.application_id);
                });

            migrationBuilder.CreateTable(
                name: "job_search_queries",
                schema: "jobs",
                columns: table => new
                {
                    search_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    query = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    radius = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_search_queries", x => x.search_id);
                });

            migrationBuilder.CreateTable(
                name: "job_search_results",
                schema: "jobs",
                columns: table => new
                {
                    result_id = table.Column<Guid>(type: "uuid", nullable: false),
                    search_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vacancy_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_search_results", x => x.result_id);
                });

            migrationBuilder.CreateTable(
                name: "recommended_job_queries",
                schema: "jobs",
                columns: table => new
                {
                    recommended_query_id = table.Column<Guid>(type: "uuid", nullable: false),
                    query = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recommended_job_queries", x => x.recommended_query_id);
                });

            migrationBuilder.CreateTable(
                name: "user_vacancies_favorites",
                schema: "jobs",
                columns: table => new
                {
                    favorite_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    vacancy_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_vacancies_favorites", x => x.favorite_id);
                });

            migrationBuilder.CreateTable(
                name: "vacancies",
                schema: "jobs",
                columns: table => new
                {
                    vacancy_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    posted_by = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    job_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    schedule = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    salary_from = table.Column<decimal>(type: "numeric", nullable: true),
                    salary_to = table.Column<decimal>(type: "numeric", nullable: true),
                    salary_currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    posted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vacancies", x => x.vacancy_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_job_applications_user_id",
                schema: "jobs",
                table: "job_applications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_job_applications_vacancy_id",
                schema: "jobs",
                table: "job_applications",
                column: "vacancy_id");

            migrationBuilder.CreateIndex(
                name: "IX_job_applications_vacancy_id_user_id",
                schema: "jobs",
                table: "job_applications",
                columns: new[] { "vacancy_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_job_search_queries_user_id_created_at",
                schema: "jobs",
                table: "job_search_queries",
                columns: new[] { "user_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_job_search_results_search_id_order_index",
                schema: "jobs",
                table: "job_search_results",
                columns: new[] { "search_id", "order_index" });

            migrationBuilder.CreateIndex(
                name: "IX_job_search_results_search_id_vacancy_id",
                schema: "jobs",
                table: "job_search_results",
                columns: new[] { "search_id", "vacancy_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_job_search_results_vacancy_id",
                schema: "jobs",
                table: "job_search_results",
                column: "vacancy_id");

            migrationBuilder.CreateIndex(
                name: "IX_recommended_job_queries_query",
                schema: "jobs",
                table: "recommended_job_queries",
                column: "query",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_vacancies_favorites_user_id",
                schema: "jobs",
                table: "user_vacancies_favorites",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_vacancies_favorites_user_id_vacancy_id",
                schema: "jobs",
                table: "user_vacancies_favorites",
                columns: new[] { "user_id", "vacancy_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_vacancies_favorites_vacancy_id",
                schema: "jobs",
                table: "user_vacancies_favorites",
                column: "vacancy_id");

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_company_id",
                schema: "jobs",
                table: "vacancies",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_posted_at",
                schema: "jobs",
                table: "vacancies",
                column: "posted_at");

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_posted_by",
                schema: "jobs",
                table: "vacancies",
                column: "posted_by");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_search_results",
                schema: "jobs");

            migrationBuilder.DropTable(
                name: "recommended_job_queries",
                schema: "jobs");

            migrationBuilder.DropTable(
                name: "job_applications",
                schema: "jobs");

            migrationBuilder.DropTable(
                name: "user_vacancies_favorites",
                schema: "jobs");

            migrationBuilder.DropTable(
                name: "job_search_queries",
                schema: "jobs");

            migrationBuilder.DropTable(
                name: "vacancies",
                schema: "jobs");
        }
    }
}
