#!/bin/bash
set -e

echo "Starting LinkedIn API..."
echo "Database: $ConnectionStrings__DefaultConnection"

# Start the application
# Migrations will be applied automatically by Program.cs
exec dotnet Facade.API.dll
