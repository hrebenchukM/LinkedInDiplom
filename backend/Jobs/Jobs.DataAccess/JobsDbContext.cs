using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jobs.DataAccess;

public class JobsDbContext : DbContext
{
    public DbSet<Vacancy> Vacancies { get; set; } = default!;
    public DbSet<UserVacancyFavorite> UserVacancyFavorites { get; set; } = default!;
    public DbSet<JobApplication> JobApplications { get; set; } = default!;
    public DbSet<JobSearchQuery> JobSearchQueries { get; set; } = default!;
    public DbSet<JobSearchResult> JobSearchResults { get; set; } = default!;
    public DbSet<RecommendedJobQuery> RecommendedJobQueries { get; set; } = default!;

    public JobsDbContext(DbContextOptions<JobsDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("jobs");

        builder.Entity<Vacancy>(entity =>
        {
            entity.ToTable("vacancies");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("vacancy_id");

            entity.Property(e => e.CompanyId)
                .HasColumnName("company_id")
                .IsRequired();

            entity.Property(e => e.PostedBy)
                .HasColumnName("posted_by")
                .IsRequired();

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.JobType)
                .HasColumnName("job_type")
                .HasMaxLength(100);

            entity.Property(e => e.Schedule)
                .HasColumnName("schedule")
                .HasMaxLength(100);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(200);

            entity.Property(e => e.SalaryFrom)
                .HasColumnName("salary_from");

            entity.Property(e => e.SalaryTo)
                .HasColumnName("salary_to");

            entity.Property(e => e.SalaryCurrency)
                .HasColumnName("salary_currency")
                .HasMaxLength(10);

            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.Property(e => e.PostedAt)
                .HasColumnName("posted_at")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.CompanyId)
                .HasDatabaseName("IX_vacancies_company_id");

            entity.HasIndex(e => e.PostedBy)
                .HasDatabaseName("IX_vacancies_posted_by");

            entity.HasIndex(e => e.PostedAt)
                .HasDatabaseName("IX_vacancies_posted_at");
        });

        builder.Entity<UserVacancyFavorite>(entity =>
        {
            entity.ToTable("user_vacancies_favorites");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("favorite_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.VacancyId)
                .HasColumnName("vacancy_id")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_user_vacancies_favorites_user_id");

            entity.HasIndex(e => e.VacancyId)
                .HasDatabaseName("IX_user_vacancies_favorites_vacancy_id");

            entity.HasIndex(e => new { e.UserId, e.VacancyId })
                .IsUnique()
                .HasDatabaseName("IX_user_vacancies_favorites_user_id_vacancy_id");
        });

        builder.Entity<JobApplication>(entity =>
        {
            entity.ToTable("job_applications");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("application_id");

            entity.Property(e => e.VacancyId)
                .HasColumnName("vacancy_id")
                .IsRequired();

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.AppliedAt)
                .HasColumnName("applied_at")
                .IsRequired();

            entity.Property(e => e.StatusChangedAt)
                .HasColumnName("status_changed_at");

            entity.Property(e => e.WithdrawnAt)
                .HasColumnName("withdrawn_at");

            entity.HasIndex(e => e.VacancyId)
                .HasDatabaseName("IX_job_applications_vacancy_id");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_job_applications_user_id");

            entity.HasIndex(e => new { e.VacancyId, e.UserId })
                .IsUnique()
                .HasDatabaseName("IX_job_applications_vacancy_id_user_id");
        });

        builder.Entity<JobSearchQuery>(entity =>
        {
            entity.ToTable("job_search_queries");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("search_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.Query)
                .HasColumnName("query")
                .HasMaxLength(300);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(200);

            entity.Property(e => e.Radius)
                .HasColumnName("radius");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.UserId, e.CreatedAt })
                .HasDatabaseName("IX_job_search_queries_user_id_created_at");
        });

        builder.Entity<JobSearchResult>(entity =>
        {
            entity.ToTable("job_search_results");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("result_id");

            entity.Property(e => e.SearchId)
                .HasColumnName("search_id")
                .IsRequired();

            entity.Property(e => e.VacancyId)
                .HasColumnName("vacancy_id")
                .IsRequired();

            entity.Property(e => e.OrderIndex)
                .HasColumnName("order_index")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => new { e.SearchId, e.OrderIndex })
                .HasDatabaseName("IX_job_search_results_search_id_order_index");

            entity.HasIndex(e => e.VacancyId)
                .HasDatabaseName("IX_job_search_results_vacancy_id");

            entity.HasIndex(e => new { e.SearchId, e.VacancyId })
                .IsUnique()
                .HasDatabaseName("IX_job_search_results_search_id_vacancy_id");
        });

        builder.Entity<RecommendedJobQuery>(entity =>
        {
            entity.ToTable("recommended_job_queries");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("recommended_query_id");

            entity.Property(e => e.Query)
                .HasColumnName("query")
                .HasMaxLength(300)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            entity.HasIndex(e => e.Query)
                .IsUnique()
                .HasDatabaseName("IX_recommended_job_queries_query");
        });
    }
}
