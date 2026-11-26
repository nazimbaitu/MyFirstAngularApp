using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using ShopKhata.Domain.Entities;
using ShopKhata.Domain.Enums;
using ShopKhata.Infrastructure.Persistence;

namespace ShopKhata.Tests;

public sealed class PersistenceTests
{
    [Fact]
    public async Task Sqlite_schema_persists_a_shop_ledger_and_payment()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ShopKhataDbContext>().UseSqlite(connection).Options;
        await using var db = new ShopKhataDbContext(options);
        await db.Database.EnsureCreatedAsync();

        var shop = new Shop("Corner Shop");
        shop.EnsureSettings();
        var customer = new Customer(shop.Id, "A. Customer", "5551234", 10);
        var transaction = new KhataTransaction(shop.Id, customer.Id, "KH-TEST", DateTime.UtcNow, Guid.NewGuid());
        transaction.AddItem("Rice", 2, 1.25m);
        var payment = new Payment(shop.Id, customer.Id, "PM-TEST", 5, DateTime.UtcNow, PaymentMethod.Cash, Guid.NewGuid());
        db.Shops.Add(shop);
        db.Customers.Add(customer);
        db.Transactions.Add(transaction);
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        var saved = await db.Transactions.Include(x => x.Items).SingleAsync();
        Assert.Equal(2.50m, saved.Total);
        Assert.Equal("Corner Shop", await db.Shops.Select(x => x.Name).SingleAsync());
        Assert.Equal(5m, await db.Payments.Select(x => x.Amount).SingleAsync());
    }
}
