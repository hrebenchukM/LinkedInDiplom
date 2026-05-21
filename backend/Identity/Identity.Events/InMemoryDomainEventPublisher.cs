using Identity.Events.Contracts.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Events;

// Простая in-process реализация событий.
// Работает внутри одного приложения, без RabbitMQ/Kafka.
public class InMemoryDomainEventPublisher : IDomainEventPublisher
{
    private readonly IServiceProvider _serviceProvider;

    public InMemoryDomainEventPublisher(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task PublishAsync<TEvent>(
        TEvent domainEvent,
        CancellationToken cancellationToken = default)
        where TEvent : class
    {
        var handlers = _serviceProvider.GetServices<IDomainEventHandler<TEvent>>();

        foreach (var handler in handlers)
        {
            await handler.HandleAsync(domainEvent, cancellationToken);
        }
    }
}