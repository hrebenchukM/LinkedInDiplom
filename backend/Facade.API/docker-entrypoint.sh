#!/bin/bash
set -e

echo "Starting LinkedIn API..."
echo "Database: $ConnectionStrings__DefaultConnection"

exec dotnet Facade.API.dll