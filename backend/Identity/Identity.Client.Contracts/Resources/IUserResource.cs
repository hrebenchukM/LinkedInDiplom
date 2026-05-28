using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

// Ресурс для работы с пользователями
public interface IUserResource
{
    // Получить пользователя по Id
    Task<UserDto?> GetAsync(GetUserByIdParameters parameters);

    // Зарегистрировать пользователя
    Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters);
}


//Чтобы Facade/IdentityClient не зависели от конкретного класса напрямую.
//Они знают только интерфейс:IUserResource
//А кто именно внутри будет выполнять работу — не важно.


//А потом, если Identity вынесешь в микросервис, можно сделать:HttpUserResource
//И он будет не напрямую сервис вызывать, а отправлять HTTP-запросы.