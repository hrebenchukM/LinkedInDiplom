using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Realtime;

public interface IMessagingRealtimeNotifier
{
    Task NotifyMessageCreatedAsync(
        Guid chatId,
        MessageDto message,
        CancellationToken cancellationToken = default);

    Task NotifyMessageUpdatedAsync(
        Guid chatId,
        MessageDto message,
        CancellationToken cancellationToken = default);

    Task NotifyMessageDeletedAsync(
        Guid chatId,
        Guid messageId,
        CancellationToken cancellationToken = default);

    Task NotifyMessageReadAsync(
        Guid chatId,
        MessageReadDto read,
        CancellationToken cancellationToken = default);

    Task NotifyMessageMediaAttachedAsync(
        Guid chatId,
        MessageMediaDto media,
        CancellationToken cancellationToken = default);
}
