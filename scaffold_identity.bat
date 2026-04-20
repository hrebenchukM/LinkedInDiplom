@echo off
cd backend

REM Create Identity folder structure
if not exist "Identity" mkdir Identity
cd Identity

REM Core Module Projects
dotnet new classlib -n Identity.Contracts -f net10.0
dotnet new classlib -n Identity.Services -f net10.0
dotnet new classlib -n Identity.DataAccess -f net10.0
dotnet new classlib -n Identity.Client -f net10.0
dotnet new classlib -n Identity.Client.Contracts -f net10.0
dotnet new classlib -n Identity.Events.Contracts -f net10.0
dotnet new classlib -n Identity.Events -f net10.0
dotnet new classlib -n Identity.DI -f net10.0

REM Facade Module Projects
dotnet new classlib -n Facade.IdentityManagement.Contracts -f net10.0
dotnet new classlib -n Facade.IdentityManagement.Services -f net10.0
dotnet new classlib -n Facade.IdentityManagement.Controllers -f net10.0
dotnet new classlib -n Facade.IdentityManagement.DI -f net10.0

REM Go back to backend directory
cd ..

REM Create solution file if it doesn't exist in backend directory
if not exist "Backend.sln" dotnet new sln -n Backend

REM Add all projects to solution
dotnet sln Backend.sln add Identity/Identity.Contracts/Identity.Contracts.csproj
dotnet sln Backend.sln add Identity/Identity.Services/Identity.Services.csproj
dotnet sln Backend.sln add Identity/Identity.DataAccess/Identity.DataAccess.csproj
dotnet sln Backend.sln add Identity/Identity.Client/Identity.Client.csproj
dotnet sln Backend.sln add Identity/Identity.Client.Contracts/Identity.Client.Contracts.csproj
dotnet sln Backend.sln add Identity/Identity.Events.Contracts/Identity.Events.Contracts.csproj
dotnet sln Backend.sln add Identity/Identity.Events/Identity.Events.csproj
dotnet sln Backend.sln add Identity/Identity.DI/Identity.DI.csproj
dotnet sln Backend.sln add Identity/Facade.IdentityManagement.Contracts/Facade.IdentityManagement.Contracts.csproj
dotnet sln Backend.sln add Identity/Facade.IdentityManagement.Services/Facade.IdentityManagement.Services.csproj
dotnet sln Backend.sln add Identity/Facade.IdentityManagement.Controllers/Facade.IdentityManagement.Controllers.csproj
dotnet sln Backend.sln add Identity/Facade.IdentityManagement.DI/Facade.IdentityManagement.DI.csproj

echo.
echo Identity module scaffolding complete!
