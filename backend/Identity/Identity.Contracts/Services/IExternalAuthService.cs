using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Contracts.Services;

public interface IExternalAuthService
{
    Task<LoginResult> ExternalLoginAsync(ExternalLoginParameters parameters);
}
