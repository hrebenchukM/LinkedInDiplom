namespace Identity.Events.Contracts.Events;

// Событие: пользователь зарегистрировался
public record UserRegisteredEvent
{
    // Id созданного пользователя
    public string UserId { get; init; } = default!;

    // UserName созданного пользователя
    public string UserName { get; init; } = default!;

    // Email созданного пользователя
    public string Email { get; init; } = default!;

    // Дата регистрации
    public DateTime RegisteredAt { get; init; }
}

//Это факт:

//пользователь зарегистрировался

//В будущем на это событие могут реагировать другие части системы:

//отправить email
//создать профиль
//записать лог