using Identity.Client.Contracts;
using Identity.Client.Contracts.Resources;

namespace Identity.Client;

// Реализация главного клиента Identity-модуля
public class IdentityClient : IIdentityClient
{
    // Получаем ресурсы через DI
    public IdentityClient(
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