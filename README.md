# ShopKhata

ShopKhata contains the existing Angular application and an ASP.NET Core 8 Clean Architecture backend. The Angular `src` tree is retained; .NET projects live alongside it under `src`.

## Solution layout

* `src/ShopKhata.Domain` — entities, domain enums, exceptions, and the Money value object.
* `src/ShopKhata.Application` — MediatR requests/handlers, DTOs, and application ports.
* `src/ShopKhata.Infrastructure` — EF Core SQL Server persistence, migrations, and PBKDF2 credential hashing.
* `src/ShopKhata.WebApi` — JWT-authenticated API, controllers, authorization, CORS, and exception handling.
* `tests/ShopKhata.Tests` — domain unit tests.

The API covers authentication, customers, khata transactions, payments, employees, daily/monthly/outstanding reports, shop settings, and notifications. All shop-owned data is scoped to the authenticated `shop_id` claim. There are no delete routes; transactions can be cancelled using their existing cancellation route.

## Database migrations

Run these commands from the repository root in PowerShell to apply the checked-in migrations without replacing existing database records:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.22
dotnet restore ShopKhata.sln
dotnet ef database update --project src\ShopKhata.Infrastructure\ShopKhata.Infrastructure.csproj --startup-project src\ShopKhata.WebApi\ShopKhata.WebApi.csproj --context ShopKhataDbContext
```

`dotnet-ef` can be updated with `dotnet tool update --global dotnet-ef --version 8.0.22`. The API applies existing migrations at startup. Database seeding is disabled by default and never inserts sample customers, transactions, payments, or notifications.

To provision an owner account, opt in with `Seed__Enabled=true` and provide `Seed__OwnerUserName`, `Seed__OwnerPassword` (at least 12 characters), and `Seed__OwnerName` through environment variables or a secret store. If the database has exactly one shop and no user accounts, the initializer adds the owner account to that shop without changing its existing records. If there is no shop, also provide `Seed__ShopName`; only the shop, its settings, the owner account, and the owner employee record are created. To explicitly add an additional owner when accounts already exist, also set `Seed__AllowAdditionalOwner=true`; this only adds the configured owner to a single existing shop and does not change existing accounts or passwords. It refuses to choose between multiple shops and does not recreate an account whose username already exists. Never commit credentials to source control. In non-development environments, also supply `Jwt__SigningKey` (at least 32 bytes), the database connection string, and allowed CORS origins.

## Build and run the API

```powershell
dotnet restore ShopKhata.sln
dotnet build ShopKhata.sln --no-restore
dotnet test ShopKhata.sln --no-build
dotnet run --project src\ShopKhata.WebApi\ShopKhata.WebApi.csproj
```

Swagger is enabled in development at `http://localhost:5116/swagger`. Sign in from the Angular login page using an existing account; the app sends the returned bearer token with API requests. The Angular development API URL is `http://localhost:5116/api`. Production builds use the same-origin `/api` path and require a reverse proxy to the API.

## Angular development

Run `npm install` once and `npm start` to launch the Angular client at `http://localhost:4200/`. `npm run build` builds the frontend and `npm test -- --watch=false` runs the Angular tests. The client reads and writes data through the API; it does not seed or cache business records in browser storage.
