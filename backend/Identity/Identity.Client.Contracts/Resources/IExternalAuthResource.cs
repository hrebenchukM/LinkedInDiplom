using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

public interface IExternalAuthResource
{
    Task<LoginResult> ExternalLoginAsync(ExternalLoginParameters parameters);
}
