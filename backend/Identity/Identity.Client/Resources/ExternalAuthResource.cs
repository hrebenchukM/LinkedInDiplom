using Identity.Client.Contracts.Resources;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

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
