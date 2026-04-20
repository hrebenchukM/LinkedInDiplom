using Microsoft.AspNetCore.Identity;

namespace Identity.DataAccess.Entities;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
