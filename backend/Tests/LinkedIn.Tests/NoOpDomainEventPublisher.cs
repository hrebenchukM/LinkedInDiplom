using Identity.Events.Contracts.Abstractions;

namespace LinkedIn.Tests;

internal sealed class NoOpDomainEventPublisher : IDomainEventPublisher
{
    public Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default)
        where TEvent : class => Task.CompletedTask;
}
