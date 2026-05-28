namespace Identity.Events.Contracts.Abstractions;

// Публикует доменные события внутри модульного монолита
public interface IDomainEventPublisher//интерфейс для того, кто публикует события.кто сообщает событие
{
    Task PublishAsync<TEvent>(
        TEvent domainEvent,
        CancellationToken cancellationToken = default)
        where TEvent : class;
}

//договор:“Я умею сообщать проекту, что что-то произошло.”

//Publisher:
//"Пользователь зарегистрировался!"

//Handlers:
//- создать профиль
//- отправить welcome email
//- записать activity log
