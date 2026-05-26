using Identity.Client.Contracts.Resources;

namespace Identity.Client.Contracts;

// Главный клиент Identity-модуля.
// Через него другие модули получают доступ к Users и Authentication.
public interface IIdentityClient
{
    // Доступ к операциям пользователей
    IUserResource Users { get; }

    // Доступ к операциям авторизации
    IAuthenticationResource Authentication { get; }

    // Внешняя авторизация (Google, Facebook)
    IExternalAuthResource ExternalAuth { get; }
}