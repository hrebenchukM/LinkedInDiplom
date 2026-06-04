using Profile.Client.Contracts.Resources;

namespace Profile.Client.Contracts;

// Внутренний клиент Profile-модуля.
// По аналогии с Identity.Client.
public interface IProfileClient
{
    IProfileResource Profiles { get; }

    IMessageSettingsResource MessageSettings { get; }

    IProfileViewResource ProfileViews { get; }
}