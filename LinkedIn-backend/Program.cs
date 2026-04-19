using LinkedIn_backend.BLL.Interfaces;
using LinkedIn_backend.BLL.Services;
using LinkedIn_backend.BLL.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

string? connection = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddScoped<IPassword, PasswordService>();
builder.Services.AddSoccerContext(connection!);
builder.Services.AddUnitOfWorkService();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();