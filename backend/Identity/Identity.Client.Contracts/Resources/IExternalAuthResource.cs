using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

public interface IExternalAuthResource
{
    Task<LoginResult> ExternalLoginAsync(ExternalLoginParameters parameters);
}

//Чтобы Facade/IdentityClient не зависели от конкретного класса напрямую.
//Они знают только интерфейс:IExternalAuthResource
//А кто именно внутри будет выполнять работу — не важно.


//А потом, если Identity вынесешь в микросервис, можно сделать:HttpExternalAuthResource
//И он будет не напрямую сервис вызывать, а отправлять HTTP-запросы.