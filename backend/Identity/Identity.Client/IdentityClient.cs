using Identity.Client.Contracts;
using Identity.Client.Contracts.Resources;

namespace Identity.Client;

// Реализация главного клиента Identity-модуля
//главный вход в Identity-модуль.(пульт управления)
public class IdentityClient : IIdentityClient
{
    // Получаем ресурсы через DI
    public IdentityClient(//Дай мне через DI три ресурса
        IUserResource userResource,
        IAuthenticationResource authenticationResource,
        IExternalAuthResource externalAuthResource)
    {
        Users = userResource;
        Authentication = authenticationResource;
        ExternalAuth = externalAuthResource;
    }

    // Ресурс пользователей
    public IUserResource Users { get; }

    // Ресурс авторизации
    public IAuthenticationResource Authentication { get; }

    // Google/Facebook авторизация
    public IExternalAuthResource ExternalAuth { get; }
}
//Чтобы Facade не таскал отдельно кучу сервисов,А получил один общий клиент,И через него работал со всем Identity-модулем.