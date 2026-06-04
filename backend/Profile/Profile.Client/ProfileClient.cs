using Profile.Client.Contracts;
using Profile.Client.Contracts.Resources;

namespace Profile.Client;

// Внутренний клиент Profile-модуля.
// Он отдаёт доступ к Profile resources.
public class ProfileClient : IProfileClient
{
    public IProfileResource Profiles { get; }

    public IMessageSettingsResource MessageSettings { get; }

    public IProfileViewResource ProfileViews { get; }

    public ProfileClient(
        IProfileResource profiles,
        IMessageSettingsResource messageSettings,
        IProfileViewResource profileViews)
    {
        Profiles = profiles;
        MessageSettings = messageSettings;
        ProfileViews = profileViews;
    }
}