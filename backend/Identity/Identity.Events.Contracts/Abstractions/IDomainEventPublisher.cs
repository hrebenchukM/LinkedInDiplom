namespace Identity.Events.Contracts.Abstractions;

// Публикует доменные события внутри модульного монолита
public interface IDomainEventPublisher
{
    Task PublishAsync<TEvent>(
        TEvent domainEvent,
        CancellationToken cancellationToken = default)
        where TEvent : class;
}