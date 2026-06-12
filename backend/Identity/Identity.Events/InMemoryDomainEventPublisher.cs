using Identity.Events.Contracts.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Events;

// Простая in-process реализация событий. Observer паттерн(Publisher / Subscriber)
//Publisher = тот, кто сообщает "что-то случилось" Subscriber / Handler = тот, кто слушает и реагирует
//разносчик событий внутри одного приложения без очередей и отдельных микросервисов.
//Когда в Identity что-то произошло, этот класс сообщает об этом другим частям проекта.
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
        var handlers = _serviceProvider.GetServices<IDomainEventHandler<TEvent>>();//Найди все классы, которые умеют обрабатывать это событие.

        foreach (var handler in handlers)
        {
            await handler.HandleAsync(domainEvent, cancellationToken);//По очереди запусти каждого обработчика события
        }
    }

}

//Например произошло событие:Юзер зарегистрировался
//Тогда можно вызвать:PublishAsync(new UserRegisteredEvent(...))
//А InMemoryDomainEventPublisher найдёт всех, кто должен реагировать на это событие, и вызовет их.

//Identity.Services
//   ↓
//событие "UserRegistered"
//   ↓
//InMemoryDomainEventPublisher
//   ↓
//handlers внутри этого же backend-а


//Чтобы IdentityService не знал про все остальные модули, он просто публикует событие А другие модули сами реагируют ! без прямой зависимости друг от друга .