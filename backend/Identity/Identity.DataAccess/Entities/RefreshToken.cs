namespace Identity.DataAccess.Entities;
//3. Как хранить токены(RefreshToken)
//Это таблица:
//RefreshTokens
//JWT токен живёт мало:
//15 минут
//Чтобы пользователь не логинился каждый раз:
//мы даём ему refresh token(долго живёт)
public class RefreshToken
{
    public int Id { get; set; }

    public string Token { get; set; } = default!;

    public string UserId { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    //если токен украли → его можно отключить
    public bool IsRevoked { get; set; }

    public DateTime? RevokedAt { get; set; }
    //Когда обновляешь токен: старый → заменяется новым

    public string? ReplacedByToken { get; set; }

    //связь с пользователем
    public ApplicationUser User { get; set; } = default!;

    //истёк ли токен
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    //токен можно использовать?
    public bool IsActive => !IsRevoked && !IsExpired;
}