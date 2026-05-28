using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

// Ресурс для авторизации и токенов
public interface IAuthenticationResource//(договор)
{
    // Логин
    Task<LoginResult> LoginAsync(LoginParameters parameters);

    // Обновить access token по refresh token
    Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters);

    // Отозвать один refresh token
    Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters);

    // Отозвать все refresh tokens пользователя
    Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId);
}

//Чтобы Facade/IdentityClient не зависели от конкретного класса напрямую.
//Они знают только интерфейс:IAuthenticationResource
//А кто именно внутри будет выполнять работу — не важно.


//А потом, если Identity вынесешь в микросервис, можно сделать:HttpAuthenticationResource
//И он будет не напрямую сервис вызывать, а отправлять HTTP-запросы.