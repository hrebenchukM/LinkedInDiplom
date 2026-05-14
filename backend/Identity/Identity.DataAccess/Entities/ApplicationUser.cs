using Microsoft.AspNetCore.Identity;

namespace Identity.DataAccess.Entities;

//1. Кто такой пользователь (ApplicationUser) = как выглядит таблица Users
public class ApplicationUser : IdentityUser//“Я беру готового пользователя от Microsoft и расширяю его”
//Id
//Email
//UserName
//PasswordHash
//PhoneNumber
{
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
    //у пользователя может быть МНОГО refresh токенов - навигационная связь 
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}