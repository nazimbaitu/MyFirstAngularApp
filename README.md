# ShopKhata

ShopKhata contains the existing Angular application and an ASP.NET Core 8 Clean Architecture backend. The Angular `src` tree is retained; .NET projects live alongside it under `src`.

## Solution layout

* `src/ShopKhata.Domain` — entities, domain enums, exceptions, and the Money value object.
* `src/ShopKhata.Application` — MediatR requests/handlers, DTOs, and application ports.
* `src/ShopKhata.Infrastructure` — EF Core SQLite persistence, migration factory, and PBKDF2 credential hashing.
* `src/ShopKhata.WebApi` — JWT-authenticated API, controllers, authorization, CORS, and exception handling.
* `tests/ShopKhata.Tests` — domain unit tests.

The API covers authentication, customers, khata transactions, payments, employees, daily/monthly/outstanding reports, shop settings, and notifications. All shop-owned data is scoped to the authenticated `shop_id` claim. No migration source is checked in; generate it after the model is ready using the sequence below.

## Database migrations

Run these commands from the repository root in PowerShell. They generate the migration from the current EF model (do not create migration files by hand), then apply it:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.22
dotnet restore ShopKhata.sln
dotnet ef migrations add InitialCreate --project src\ShopKhata.Infrastructure\ShopKhata.Infrastructure.csproj --startup-project src\ShopKhata.WebApi\ShopKhata.WebApi.csproj --context ShopKhataDbContext --output-dir Persistence\Migrations
dotnet ef database update --project src\ShopKhata.Infrastructure\ShopKhata.Infrastructure.csproj --startup-project src\ShopKhata.WebApi\ShopKhata.WebApi.csproj --context ShopKhataDbContext
```

`dotnet-ef` can be updated with `dotnet tool update --global dotnet-ef --version 8.0.22`. The API applies existing migrations at startup. To initialize a development owner, set `Seed__Enabled=true`, `Seed__OwnerUserName`, and a strong `Seed__OwnerPassword`; seeding is disabled by default. In non-development environments, supply `Jwt__SigningKey` from a secret store (at least 32 bytes), and configure the database connection string and CORS origins.

## Build and run the API

```powershell
dotnet restore ShopKhata.sln
dotnet build ShopKhata.sln --no-restore
dotnet test ShopKhata.sln --no-build
dotnet run --project src\ShopKhata.WebApi\ShopKhata.WebApi.csproj
```

Swagger is enabled in development. Authentication is `POST /api/auth/login` with `{ "userName": "...", "password": "..." }`; send the returned bearer token for the other API routes.

## Angular development

Run `npm install` once and `npm start` to launch the retained Angular client at `http://localhost:4200/`. `npm run build` builds the frontend.
