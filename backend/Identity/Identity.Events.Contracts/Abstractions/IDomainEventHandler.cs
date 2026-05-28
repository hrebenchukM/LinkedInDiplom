using Identity.Events.Contracts.Events;

namespace Identity.Events.Contracts.Abstractions;

// Интерфейс для Обработчика доменного события
public interface IDomainEventHandler<in TEvent>
    where TEvent : class
{
    Task HandleAsync(
        TEvent domainEvent,
        CancellationToken cancellationToken = default);//“Вот событие, обработай его.”
}

//IDomainEventHandler = договор для класса, который слушает событие

//UserRegisteredEvent произошло
//        ↓
//нашли все IDomainEventHandler<UserRegisteredEvent>
//        ↓
//каждый обработчик сделал свою работу