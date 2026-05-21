using Profile.Client.Contracts;
using Profile.Client.Contracts.Resources;

namespace Profile.Client;

// Внутренний клиент Profile-модуля.
// Он отдаёт доступ к Profile resources.
public class ProfileClient : IProfileClient
{
    public IProfileResource Profiles { get; }

    public ProfileClient(IProfileResource profiles)
    {
        Profiles = profiles;
    }
}