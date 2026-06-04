using Identity.Client.Contracts.Resources;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

//прослойка, чтобы  проект был готов к микросервисам. —ейчас он просто вызывает сервис напр€мую, а в будущем его можно заменить на HTTP-клиент.
public class ExternalAuthResource : IExternalAuthResource
{
    private readonly IExternalAuthService _externalAuthService;

    public ExternalAuthResource(IExternalAuthService externalAuthService)
    {
        _externalAuthService = externalAuthService;
    }

    public Task<LoginResult> ExternalLoginAsync(ExternalLoginParameters parameters)
        => _externalAuthService.ExternalLoginAsync(parameters);
}
