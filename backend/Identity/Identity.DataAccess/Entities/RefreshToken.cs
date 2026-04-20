namespace Identity.DataAccess.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
    
    // Navigation property
    public ApplicationUser User { get; set; } = default!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
