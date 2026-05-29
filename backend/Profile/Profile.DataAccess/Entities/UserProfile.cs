namespace Profile.DataAccess.Entities;

public class UserProfile
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? AvatarUrl { get; set; }

    public string? HeaderUrl { get; set; }

    public string? ProfileTitle { get; set; }

    public string? Headline { get; set; }

    public string? GenInfo { get; set; }

    public string? University { get; set; }

    public string? Location { get; set; }

    public string? PortfolioUrl { get; set; }

    public bool IsCompany { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}