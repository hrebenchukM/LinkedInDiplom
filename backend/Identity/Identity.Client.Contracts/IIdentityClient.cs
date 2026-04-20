using Identity.Client.Contracts.Resources;

namespace Identity.Client.Contracts;

public interface IIdentityClient
{
    IUserResource Users { get; }
    IAuthenticationResource Authentication { get; }
}
