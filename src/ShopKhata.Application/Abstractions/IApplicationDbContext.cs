using Microsoft.EntityFrameworkCore;
using ShopKhata.Domain.Entities;

namespace ShopKhata.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<Shop> Shops { get; }
    DbSet<ShopSettings> ShopSettings { get; }
    DbSet<Customer> Customers { get; }
    DbSet<KhataTransaction> Transactions { get; }
    DbSet<TransactionItem> TransactionItems { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Employee> Employees { get; }
    DbSet<UserAccount> UserAccounts { get; }
    DbSet<ShopNotification> Notifications { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
