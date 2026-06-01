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
    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
    //у пользователя может быть МНОГО refresh токенов - навигационная связь 
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}