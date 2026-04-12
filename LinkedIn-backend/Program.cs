//using LinkedIn_backend.BLL.Interfaces;
//using LinkedIn_backend.BLL.Services;
//using LinkedIn_backend.BLL.Infrastructure;



var builder = WebApplication.CreateBuilder(args);

///////////////////////////////////////////////////////////////////////////////
//builder.Services.AddCors(); // добавляем сервисы CORS
//// Все сессии работают поверх объекта IDistributedCache, и ASP.NET Core 
//// предоставляет встроенную реализацию IDistributedCache
//builder.Services.AddDistributedMemoryCache();
//builder.Services.AddSession(options =>
//{
//    options.IdleTimeout = TimeSpan.FromMinutes(10); // Длительность сеанса (тайм-аут завершения сеанса)
//    options.Cookie.Name = "Session"; // Каждая сессия имеет свой идентификатор, который сохраняется в куках.

//});
//// Получаем строку подключения из файла конфигурации
//string? connection = builder.Configuration.GetConnectionString("DefaultConnection");


//builder.Services.AddScoped<IPassword, PasswordService>();
//builder.Services.AddSoccerContext(connection);
//builder.Services.AddUnitOfWorkService();
//builder.Services.AddScoped<IUserService, UserService>();//нет проблем ибо это верхний и средний слой мы взяли добавили ссылку Add project refernce

///////////////////////////////////////////////////////////////////////////////


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();//для интерфейса

var app = builder.Build();


////////////////////////////////////////////////////////////////////////
// Чтобы задействовать CORS для обработки запроса вызывается метод app.UseCors()
// Для конфигурации параметров CORS этот метод использует делегат,
// в который передается объект CorsPolicyBuilder.
//app.UseCors(builder => builder.AllowAnyOrigin());
// AllowAnyOrigin() принимаются запросы с любых доменов/адресов.
// AllowAnyHeader() принимаются запросы с любыми заголовками.
// AllowAnyMethod() принимаются запросы любого типа. 
// AllowCredentials() разрешается принимать идентификационные данные от клиента (например, куки).
// WithHeaders() принимаются только те запросы, которые содержат определенные заголовки.
// WithMethods() принимаются запросы только определенного типа.
// WithOrigins() принимаются запросы только с определенных адресов.
// WithExposedHeaders() позволяет серверу отправлять на сторону клиента свои заголовки.
// https://developer.mozilla.org/ru/docs/Web/HTTP/Headers

//настроить корс для конкретного клиента расположенного на этом домене, однако для стальных клиентов будут действовать политики безопасности, то есть не будут работать кросдоменные запросы
//любые заголовки-когда мы делаем запрос - то что отправляется в заголовке шттп пакета(передача куки , параметров,настроек)
//любые методы -гет,пост,пут,делит
//app.UseCors(builder => builder.WithOrigins("https://localhost:7245")
//                    .AllowAnyHeader().AllowAnyMethod());





//app.UseSession();   // Добавляем middleware-компонент для работы с сессиями

////////////////////////////////////////////////////////////////////////


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();//перенаправление чтоб запросы шли по протоколу https 

app.UseAuthorization();

app.MapControllers();//добавляет таблиицу маршрутизации (маршруты с помощью атрибутов)

app.Run();
