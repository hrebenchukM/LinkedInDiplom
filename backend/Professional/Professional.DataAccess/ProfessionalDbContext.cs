using Microsoft.EntityFrameworkCore;
using Professional.DataAccess.Entities;

namespace Professional.DataAccess;

// DbContext Professional-модуля
public class ProfessionalDbContext : DbContext
{
    public DbSet<Experience> Experiences { get; set; } = default!;
    public DbSet<Company> Companies { get; set; } = default!;
    public DbSet<Academy> Academies { get; set; } = default!;
    public DbSet<Education> Educations { get; set; } = default!;
    public DbSet<Certificate> Certificates { get; set; } = default!;

    public ProfessionalDbContext(DbContextOptions<ProfessionalDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("professional");

        builder.Entity<Experience>(entity =>
        {
            entity.ToTable("experiences");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("experience_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.CompanyId)
                .HasColumnName("company_id");

            entity.Property(e => e.Position)
                .HasColumnName("position")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.EmploymentType)
                .HasColumnName("employment_type")
                .HasMaxLength(100);

            entity.Property(e => e.WorkLocationType)
                .HasColumnName("work_location_type")
                .HasMaxLength(100);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(200);

            entity.Property(e => e.StartDate)
                .HasColumnName("start_date");

            entity.Property(e => e.EndDate)
                .HasColumnName("end_date");

            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.UserId);

            entity.HasIndex(e => e.CompanyId);
        });

        builder.Entity<Company>(entity =>
        {
            entity.ToTable("companies");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("company_id");

            entity.Property(e => e.OwnerUserId)
                .HasColumnName("owner_user_id")
                .IsRequired();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.LogoUrl)
                .HasColumnName("logo_url")
                .HasMaxLength(500);

            entity.Property(e => e.Industry)
                .HasColumnName("industry")
                .HasMaxLength(200);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(200);

            entity.Property(e => e.WebsiteUrl)
                .HasColumnName("website_url")
                .HasMaxLength(500);

            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.OwnerUserId);

            entity.HasIndex(e => e.Name);
        });

        builder.Entity<Academy>(entity =>
        {
            entity.ToTable("academies");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("academy_id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.LogoUrl)
                .HasColumnName("logo_url")
                .HasMaxLength(500);

            entity.Property(e => e.WebsiteUrl)
                .HasColumnName("website_url")
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.HasIndex(e => e.Name);
        });

        builder.Entity<Education>(entity =>
        {
            entity.ToTable("educations");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("education_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.AcademyId)
                .HasColumnName("academy_id");

            entity.Property(e => e.Institution)
                .HasColumnName("institution")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Degree)
                .HasColumnName("degree")
                .HasMaxLength(200);

            entity.Property(e => e.FieldOfStudy)
                .HasColumnName("field_of_study")
                .HasMaxLength(200);

            entity.Property(e => e.StartDate)
                .HasColumnName("start_date");

            entity.Property(e => e.EndDate)
                .HasColumnName("end_date");

            entity.Property(e => e.Source)
                .HasColumnName("source")
                .HasMaxLength(200);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.UserId);

            entity.HasIndex(e => e.AcademyId);
        });

        builder.Entity<Certificate>(entity =>
        {
            entity.ToTable("certificates");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("certificate_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.AcademyId)
                .HasColumnName("academy_id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.DownloadRef)
                .HasColumnName("download_ref")
                .HasMaxLength(500);

            entity.Property(e => e.IssueDate)
                .HasColumnName("issue_date");

            entity.Property(e => e.ExpiryDate)
                .HasColumnName("expiry_date");

            entity.Property(e => e.AccreditationId)
                .HasColumnName("accreditation_id")
                .HasMaxLength(200);

            entity.Property(e => e.OrganizationUrl)
                .HasColumnName("organization_url")
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(e => e.DeletedAt)
                .HasColumnName("deleted_at");

            entity.HasIndex(e => e.UserId);

            entity.HasIndex(e => e.AcademyId);
        });
    }
}