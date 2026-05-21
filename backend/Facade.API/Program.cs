using System.Text; // Для Encoding.UTF8.GetBytes
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

var builder = WebApplication.CreateBuilder(args);

// Получаем конфигурацию из appsettings.json
var configuration = builder.Configuration;

// Получаем строку подключения к PostgreSQL
var connectionString = configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// Подключаем Identity core module
builder.Services.AddIdentityModule(configuration, connectionString);

// Подключаем Profile core module
// Теперь Profile снова работает как модуль внутри модульного монолита,
// а не как отдельный HTTP-микросервис.
builder.Services.AddProfileModule(configuration, connectionString);

// Подключаем AccountManagement facade
builder.Services.AddAccountManagementFacade();

// Подключаем ProfileManagement facade
builder.Services.AddProfileManagementFacade();

// Подключаем контроллеры из facade-модулей
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly)
    .AddApplicationPart(typeof(ProfileController).Assembly);

// Читаем JWT-настройки
var jwtSettings = configuration.GetSection("JwtSettings");

// Берём секретный ключ для подписи токена
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not configured.");

// Превращаем secret key в массив байтов
var key = Encoding.UTF8.GetBytes(secretKey);

// Настраиваем JWT-аутентификацию
builder.Services.AddAuthentication(options =>
{
    // По умолчанию проверяем JWT Bearer token
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;

    // Если пользователь не авторизован — тоже JWT Bearer
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Для разработки false, в production лучше true
    options.RequireHttpsMetadata = false;

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
});

// Подключаем авторизацию
builder.Services.AddAuthorization();

// Подключаем Swagger/OpenAPI
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

// Разрешаем запросы с фронта
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Собираем приложение
var app = builder.Build();

// Автоматически применяем миграции при запуске
await app.ApplyMigrationsAsync();

// Включаем Swagger
app.UseSwagger();

// Swagger UI будет по /swagger
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LinkedIn API v1");
    c.RoutePrefix = "swagger";
});

// Перенаправление HTTP на HTTPS
app.UseHttpsRedirection();

// Включаем CORS
app.UseCors("AllowAll");

// Отдача загруженных файлов из /app/uploads или локальной папки uploads
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");

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

// Подключаем маршруты контроллеров
app.MapControllers();

// Запускаем API
app.Run();