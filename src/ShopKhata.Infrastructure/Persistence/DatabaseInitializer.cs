using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ShopKhata.Application.Abstractions;
using ShopKhata.Domain.Entities;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services, IConfiguration configuration, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ShopKhataDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DatabaseInitializer));
        if (!db.Database.GetMigrations().Any()) return;

        await db.Database.MigrateAsync(ct);
        var seedEnabledValue = configuration["Seed:Enabled"];
        if (!bool.TryParse(seedEnabledValue, out var seedEnabled))
        {
            if (string.IsNullOrWhiteSpace(seedEnabledValue)) seedEnabled = false;
            else throw new InvalidOperationException("Seed:Enabled must be true or false.");
        }
        if (!seedEnabled) return;
        var allowAdditionalOwnerValue = configuration["Seed:AllowAdditionalOwner"];
        if (!bool.TryParse(allowAdditionalOwnerValue, out var allowAdditionalOwner))
        {
            if (string.IsNullOrWhiteSpace(allowAdditionalOwnerValue)) allowAdditionalOwner = false;
            else throw new InvalidOperationException("Seed:AllowAdditionalOwner must be true or false.");
        }
        var hasUserAccounts = await db.UserAccounts.AnyAsync(ct);
        if (hasUserAccounts && !allowAdditionalOwner)
        {
            logger.LogInformation("Owner provisioning skipped because user accounts already exist.");
            return;
        }

        var username = configuration["Seed:OwnerUserName"];
        var password = configuration["Seed:OwnerPassword"];
        var ownerName = configuration["Seed:OwnerName"];
        var shopName = configuration["Seed:ShopName"];
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(ownerName))
            throw new InvalidOperationException("When Seed:Enabled is true and no user account exists, configure Seed:OwnerUserName, Seed:OwnerPassword, and Seed:OwnerName.");
        if (password.Length < 12)
            throw new InvalidOperationException("Seed:OwnerPassword must contain at least 12 characters.");
        if (username.Trim().Length > 80 || ownerName.Trim().Length > 160)
            throw new InvalidOperationException("Seed:OwnerUserName must be at most 80 characters and Seed:OwnerName at most 160 characters.");

        var existingShops = await db.Shops.Include(x => x.Settings).Take(2).ToListAsync(ct);
        if (existingShops.Count > 1)
            throw new InvalidOperationException("Owner seeding found multiple shops and cannot choose one safely.");

        var shop = existingShops.SingleOrDefault();
        if (shop is null)
        {
            if (string.IsNullOrWhiteSpace(shopName))
                throw new InvalidOperationException("Seed:ShopName is required when creating the first shop.");
            if (shopName.Trim().Length > 160)
                throw new InvalidOperationException("Seed:ShopName must be at most 160 characters.");

            shop = new Shop(shopName, configuration["Seed:ShopPhone"]);
            shop.EnsureSettings();
            shop.Settings!.Update("PKR", null, null);
            db.Shops.Add(shop);
        }
        else if (shop.Settings is null)
        {
            shop.EnsureSettings();
            shop.Settings!.Update("PKR", null, null);
        }

        var normalizedUserName = username.Trim().ToLowerInvariant();
        if (await db.UserAccounts.AnyAsync(x => x.ShopId == shop.Id && x.UserName == normalizedUserName, ct))
        {
            logger.LogInformation("Owner provisioning skipped because the configured username already exists; its credentials were not changed.");
            return;
        }

        var employee = await db.Employees.FirstOrDefaultAsync(
            x => x.ShopId == shop.Id && x.UserName == normalizedUserName, ct);
        if (employee is not null && employee.Role != EmployeeRole.Owner)
            throw new InvalidOperationException("Seed:OwnerUserName conflicts with an existing non-owner employee.");

        var credentials = scope.ServiceProvider.GetRequiredService<ICredentialVerifier>();
        var owner = new UserAccount(shop.Id, normalizedUserName, credentials.Hash(password), EmployeeRole.Owner);
        db.UserAccounts.Add(owner);
        if (employee is null)
            db.Employees.Add(new Employee(shop.Id, ownerName, normalizedUserName, EmployeeRole.Owner, shop.Phone));
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Provisioned the configured owner account.");
    }
}
