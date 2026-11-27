using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
        if (!db.Database.GetMigrations().Any()) return;

        await db.Database.MigrateAsync(ct);
        if (await db.UserAccounts.AnyAsync(ct)) return;

        var username = configuration["Seed:OwnerUserName"] ?? "admin";
        var password = configuration["Seed:OwnerPassword"] ?? "Admin@123";
        var shop = new Shop(configuration["Seed:ShopName"] ?? "ShopKhata", configuration["Seed:ShopPhone"] ?? "0300-1234567");
        shop.EnsureSettings();
        shop.Settings!.Update("PKR", "Main Bazaar, Lahore, Pakistan", "Thank you for your business!");

        var credentials = scope.ServiceProvider.GetRequiredService<ICredentialVerifier>();
        var owner = new UserAccount(shop.Id, username, credentials.Hash(password), EmployeeRole.Owner);
        var sara = new UserAccount(shop.Id, "sara.k", credentials.Hash("Welcome@123"), EmployeeRole.Cashier);
        var hamza = new UserAccount(shop.Id, "hamza.a", credentials.Hash("Welcome@123"), EmployeeRole.Cashier);
        hamza.SetStatus(RecordStatus.Inactive);
        db.Shops.Add(shop);
        db.UserAccounts.AddRange(owner, sara, hamza);
        db.Employees.AddRange(
            new Employee(shop.Id, "Ahmed Raza", username, EmployeeRole.Owner, "0300-7654321"),
            new Employee(shop.Id, "Sara Khan", "sara.k", EmployeeRole.Cashier, "0311-2223333"),
            new Employee(shop.Id, "Hamza Ali", "hamza.a", EmployeeRole.Cashier, "0312-4445555"));

        var ali = new Customer("NK000001", shop.Id, "Ali Hassan", "0301-1112222", 500, "Model Town Lahore", "Regular customer");
        var ahmed = new Customer("NK000002", shop.Id, "Ahmed Khan", "0302-3334444", 0, "Gulberg Lahore");
        var bilal = new Customer("NK000003", shop.Id, "Bilal Ahmed", "0303-5556666", 1200, "Johar Town", "Bulk buyer");
        var usman = new Customer("NK000004", shop.Id, "Usman Tariq", "0304-7778888", 0, "DHA Phase 5");
        var farhan = new Customer("NK000005", shop.Id, "Farhan Malik", "0305-9990000", 350, "Iqbal Town", "Prefers cash");
        farhan.SetStatus(RecordStatus.Inactive);
        db.Customers.AddRange(ali, ahmed, bilal, usman, farhan);

        var now = DateTime.UtcNow;
        var txn1 = new KhataTransaction(shop.Id, ali.Id, "SK-KH-001", now.AddDays(-5), owner.Id, "Monthly grocery");
        txn1.AddItem("Rice (5kg)", 1, 1500);
        txn1.AddItem("Sugar (2kg)", 2, 250);
        var txn2 = new KhataTransaction(shop.Id, ahmed.Id, "SK-KH-002", now.AddDays(-3), owner.Id);
        txn2.AddItem("Cooking Oil (1L)", 2, 650);
        txn2.AddItem("Milk Pack", 4, 120);
        var txn3 = new KhataTransaction(shop.Id, bilal.Id, "SK-KH-003", now.AddDays(-1), owner.Id, "Bulk order");
        txn3.AddItem("Flour Bag (10kg)", 3, 950);
        db.Transactions.AddRange(txn1, txn2, txn3);

        db.Payments.AddRange(
            new Payment(shop.Id, ali.Id, "SK-PY-001", 1000, now.AddDays(-2), PaymentMethod.Cash, owner.Id, notes: "Partial payment"),
            new Payment(shop.Id, bilal.Id, "SK-PY-002", 1500, now.AddDays(-1), PaymentMethod.EasyPaisa, owner.Id, referenceNumber: "EP-778899"));
        db.Notifications.AddRange(
            new ShopNotification(shop.Id, "New Khata Entry", "Khata entry of PKR 2,000.00 recorded for Ali Hassan."),
            new ShopNotification(shop.Id, "Payment Received", "Payment of PKR 1,000.00 received from Ali Hassan."),
            new ShopNotification(shop.Id, "New Khata Entry", "Khata entry of PKR 2,850.00 recorded for Bilal Ahmed."),
            new ShopNotification(shop.Id, "Payment Received", "Payment of PKR 1,500.00 received from Bilal Ahmed."));

        await db.SaveChangesAsync(ct);
    }
}
