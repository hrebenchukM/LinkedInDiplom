using Identity.Client.Contracts;
using Identity.Client.Contracts.Resources;
using Identity.Client.Resources;

namespace Identity.Client;

public class IdentityClient : IIdentityClient
{
    public IdentityClient(IUserResource userResource, IAuthenticationResource authenticationResource)
    {
        Users = userResource;
        Authentication = authenticationResource;
    }

    public IUserResource Users { get; }
    public IAuthenticationResource Authentication { get; }
}
