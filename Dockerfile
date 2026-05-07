# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file and project files
COPY ["LinkedIn.sln", "./"]
COPY ["backend/Facade.API/Facade.API.csproj", "backend/Facade.API/"]
COPY ["backend/Identity/Identity.Contracts/Identity.Contracts.csproj", "backend/Identity/Identity.Contracts/"]
COPY ["backend/Identity/Identity.Services/Identity.Services.csproj", "backend/Identity/Identity.Services/"]
COPY ["backend/Identity/Identity.DataAccess/Identity.DataAccess.csproj", "backend/Identity/Identity.DataAccess/"]
COPY ["backend/Identity/Identity.Client/Identity.Client.csproj", "backend/Identity/Identity.Client/"]
COPY ["backend/Identity/Identity.Client.Contracts/Identity.Client.Contracts.csproj", "backend/Identity/Identity.Client.Contracts/"]
COPY ["backend/Identity/Identity.Events/Identity.Events.csproj", "backend/Identity/Identity.Events/"]
COPY ["backend/Identity/Identity.Events.Contracts/Identity.Events.Contracts.csproj", "backend/Identity/Identity.Events.Contracts/"]
COPY ["backend/Identity/Identity.DI/Identity.DI.csproj", "backend/Identity/Identity.DI/"]
COPY ["backend/AccountManagement/Facade.AccountManagement.Contracts/Facade.AccountManagement.Contracts.csproj", "backend/AccountManagement/Facade.AccountManagement.Contracts/"]
COPY ["backend/AccountManagement/Facade.AccountManagement.Services/Facade.AccountManagement.Services.csproj", "backend/AccountManagement/Facade.AccountManagement.Services/"]
COPY ["backend/AccountManagement/Facade.AccountManagement.Controllers/Facade.AccountManagement.Controllers.csproj", "backend/AccountManagement/Facade.AccountManagement.Controllers/"]
COPY ["backend/AccountManagement/Facade.AccountManagement.DI/Facade.AccountManagement.DI.csproj", "backend/AccountManagement/Facade.AccountManagement.DI/"]

# Restore dependencies
RUN dotnet restore "backend/Facade.API/Facade.API.csproj"

# Copy everything else
COPY . .

# Build the application
WORKDIR "/src/backend/Facade.API"
RUN dotnet build "Facade.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Facade.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Facade.API.dll"]
