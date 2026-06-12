using System.Text; // Для Encoding.UTF8.GetBytes
using Facade.AdminManagement.Controllers;
using Facade.AdminManagement.DI;
using Facade.AccountManagement.Controllers.Controllers; // AccountController из фасада
using Facade.AccountManagement.DI; // AddAccountManagementFacade()
using Facade.API.Extensions; // ApplyMigrationsAsync()
using Facade.ProfileManagement.Controllers.Controllers; // ProfileController из фасада
using Facade.ProfileManagement.DI; // AddProfileManagementFacade()
using Identity.DI; // AddIdentityModule()
using Profile.DI; // AddProfileModule()
using Microsoft.AspNetCore.Authentication.JwtBearer; // JWT Bearer
using Microsoft.Extensions.FileProviders; // PhysicalFileProvider для uploads
using Microsoft.IdentityModel.Tokens; // TokenValidationParameters, SymmetricSecurityKey
using Microsoft.OpenApi.Models; // Swagger Authorize для JWT
using Professional.DI;
using Facade.ProfessionalManagement.Controllers.Controllers; // Professional*Controller
using Facade.ProfessionalManagement.DI;
using Facade.NetworkManagement.Controllers.Controllers;
using Facade.NetworkManagement.DI;
using Facade.ContentManagement.Controllers.Controllers;
using Facade.ContentManagement.DI;
using Facade.MessagingManagement.Controllers.Controllers;
using Facade.MessagingManagement.Controllers.Hubs;
using Facade.MessagingManagement.Controllers.Realtime;
using Facade.MessagingManagement.Contracts.Realtime;
using Facade.MessagingManagement.DI;
using Facade.NotificationsManagement.Controllers.Controllers;
using Facade.NotificationsManagement.DI;
using Facade.JobsManagement.Controllers.Controllers;
using Facade.JobsManagement.DI;
using Facade.EventsManagement.Controllers.Controllers;
using Facade.EventsManagement.DI;
using Facade.FileStorage.DI;
using Content.DI;
using Events.DI;
using Jobs.DI;
using Messaging.DI;
using Network.DI;

using Notifications.DI;
using Facade.API;
using Facade.API.Seeding;
using Microsoft.AspNetCore.Mvc;
using Facade.AI.DI;
using Facade.AI.Controllers.Controllers;

// Facade.API — единственный host приложения.
// Здесь нет бизнес-логики: только сборка модулей, middleware и инфраструктурных настроек.
var builder = WebApplication.CreateBuilder(args);

// Получаем конфигурацию из appsettings.json
var configuration = builder.Configuration;
var isDevelopment = builder.Environment.IsDevelopment();

// Получаем строку подключения к PostgreSQL
var connectionString = configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// Один абсолютный путь для сохранения и раздачи uploads (пустой конфиг = ContentRootPath/uploads)
var uploadsPath = ResolveUploadsPath(configuration, builder.Environment.ContentRootPath);

builder.Services.AddFileStorage(configuration);

// Подключаем Identity core module
builder.Services.AddIdentityModule(configuration, connectionString);

// Подключаем Profile core module
// Теперь Profile снова работает как модуль внутри модульного монолита,
// а не как отдельный HTTP-микросервис.
builder.Services.AddProfileModule(configuration, connectionString);
builder.Services.AddProfessionalModule(configuration, connectionString);
builder.Services.AddNetworkModule(configuration, connectionString);
builder.Services.AddContentModule(configuration, connectionString);
builder.Services.AddScoped<IDemoContentSeeder, DemoContentSeeder>();
builder.Services.AddScoped<IDemoNetworkSeeder, DemoNetworkSeeder>();
builder.Services.AddScoped<IDemoJobsSeeder, DemoJobsSeeder>();
builder.Services.AddMessagingModule(configuration, connectionString);
builder.Services.AddJobsModule(configuration, connectionString);
builder.Services.AddNotificationsModule(configuration, connectionString);
builder.Services.AddEventsModule(configuration, connectionString);

// Подключаем AccountManagement facade
builder.Services.AddAdminManagementFacade();
builder.Services.AddAccountManagementFacade();

// Подключаем ProfileManagement facade
builder.Services.AddProfileManagementFacade();
builder.Services.AddProfessionalManagementFacade();
builder.Services.AddNetworkManagementFacade();
builder.Services.AddContentManagementFacade();

builder.Services.AddMessagingManagementFacade();
builder.Services.AddJobsManagementFacade();
builder.Services.AddNotificationsManagementFacade();
builder.Services.AddEventsManagementFacade();
// Подключаем контроллеры из всех facade-модулей через ApplicationPart.
// Так host знает только сборки фасадов и не тащит код feature-контроллеров внутрь себя.
builder.Services.AddAIManagementFacade(configuration);

// Подключаем контроллеры из facade-модулей
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AdminManagementControllersAssemblyMarker).Assembly)
    .AddApplicationPart(typeof(AccountController).Assembly)
    .AddApplicationPart(typeof(ProfileProfilesController).Assembly)
    .AddApplicationPart(typeof(ProfessionalExperiencesController).Assembly)
    .AddApplicationPart(typeof(NetworkContactsController).Assembly)
    .AddApplicationPart(typeof(ContentPostsController).Assembly)
    .AddApplicationPart(typeof(MessagingChatsController).Assembly)
    .AddApplicationPart(typeof(JobsVacanciesController).Assembly)
    .AddApplicationPart(typeof(NotificationsItemsController).Assembly)
    .AddApplicationPart(typeof(EventsEventsController).Assembly)
    .AddApplicationPart(typeof(AIController).Assembly)
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var body = ValidationErrorResponse.FromModelState(context.ModelState);
            return new BadRequestObjectResult(body);
        };
    });



// Читаем JWT-настройки
var jwtSettings = configuration.GetSection("JwtSettings");

// Берём секретный ключ для подписи токена
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not configured.");

// Превращаем secret key в массив байтов
var key = Encoding.UTF8.GetBytes(secretKey);

// Настраиваем JWT-аутентификацию на уровне host.
// Контроллеры потом читают userId из claims, а не из query/body.
builder.Services.AddAuthentication(options =>
{
    // По умолчанию проверяем JWT Bearer token
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;

    // Если пользователь не авторизован — тоже JWT Bearer
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Development: false (локально/Docker по HTTP). Production: true.
    options.RequireHttpsMetadata = !isDevelopment;

    // Сохраняем токен в контексте запроса
    options.SaveToken = true;

    // Правила проверки access token
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),

        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],

        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],

        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // SignalR WebSocket negotiate не передаёт Authorization header — token из query string.
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs/messaging"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

// Подключаем авторизацию
builder.Services.AddAuthorization();

builder.Services.AddSignalR();
builder.Services.AddScoped<IMessagingRealtimeNotifier, MessagingRealtimeNotifier>();

// Swagger/OpenAPI только для локальной разработки
if (isDevelopment)
{
    builder.Services.AddEndpointsApiExplorer();

    // Swagger + кнопка Authorize для JWT
    builder.Services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Введите JWT access token"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });
}

// CORS: Development — explicit localhost origins + credentials (SignalR); Production — Cors:AllowedOrigins
builder.Services.AddCors(options =>
{
    if (isDevelopment)
    {
        options.AddPolicy("DevelopmentCors", policy =>
        {
            policy.WithOrigins(
                    "http://localhost:5173",
                    "https://localhost:5173",
                    "http://localhost:3000",
                    "https://localhost:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    }
    else
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();

        options.AddPolicy("ProductionCors", policy =>
        {
            policy.AllowAnyMethod()
                  .AllowAnyHeader();

            if (allowedOrigins.Length > 0)
            {
                policy.WithOrigins(allowedOrigins);
            }
            else
            {
                // Пока origins не заданы в конфиге — блокируем cross-origin запросы
                policy.SetIsOriginAllowed(_ => false);
            }
        });
    }
});

// Собираем приложение
var app = builder.Build();

// Host применяет миграции всех модулей при старте,
// чтобы локально и в Docker схема БД была в актуальном состоянии.
await app.ApplyMigrationsAsync();

if (app.Environment.IsDevelopment())
{
    // Включаем Swagger только в Development
    app.UseSwagger();

    // Swagger UI будет по /swagger
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LinkedIn API v1");
        c.RoutePrefix = "swagger";
    });
}

// Перенаправление HTTP на HTTPS
app.UseHttpsRedirection();

// Включаем CORS в зависимости от окружения
app.UseCors(app.Environment.IsDevelopment() ? "DevelopmentCors" : "ProductionCors");

// Отдача загруженных файлов из той же папки, что и FileStorage (FileStorage:UploadsRootPath)
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Сначала аутентификация: кто пользователь?
app.UseAuthentication();

// Потом авторизация: что ему разрешено?
app.UseAuthorization();

// Маршрутизацию полностью обрабатывают facade-контроллеры.
app.MapControllers();
app.MapHub<MessagingHub>("/hubs/messaging");

// Запускаем API
app.Run();

static string ResolveUploadsPath(IConfiguration configuration, string contentRootPath)
{
    var configuredPath = configuration["FileStorage:UploadsRootPath"];

    if (string.IsNullOrWhiteSpace(configuredPath))
        return Path.GetFullPath(Path.Combine(contentRootPath, "uploads"));

    return Path.IsPathRooted(configuredPath)
        ? Path.GetFullPath(configuredPath)
        : Path.GetFullPath(Path.Combine(contentRootPath, configuredPath));
}