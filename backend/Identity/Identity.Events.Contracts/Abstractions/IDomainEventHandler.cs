namespace Identity.Events.Contracts.Abstractions;

// Обработчик доменного события
public interface IDomainEventHandler<in TEvent>
    where TEvent : class
{
    Task HandleAsync(
        TEvent domainEvent,
        CancellationToken cancellationToken = default);
}