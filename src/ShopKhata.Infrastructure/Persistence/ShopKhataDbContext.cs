using Microsoft.EntityFrameworkCore;
using ShopKhata.Application.Abstractions;
using ShopKhata.Domain.Entities;

namespace ShopKhata.Infrastructure.Persistence;

public sealed class ShopKhataDbContext(DbContextOptions<ShopKhataDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<ShopSettings> ShopSettings => Set<ShopSettings>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<KhataTransaction> Transactions => Set<KhataTransaction>();
    public DbSet<TransactionItem> TransactionItems => Set<TransactionItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<ShopNotification> Notifications => Set<ShopNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Shop>(b =>
        {
            b.ToTable("Shops"); b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(160).IsRequired();
            b.Property(x => x.Phone).HasMaxLength(32);
            b.HasOne(x => x.Settings).WithOne().HasForeignKey<ShopSettings>(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<ShopSettings>(b =>
        {
            b.ToTable("ShopSettings"); b.HasKey(x => x.Id);
            b.HasIndex(x => x.ShopId).IsUnique();
            b.Property(x => x.Currency).HasMaxLength(3).IsRequired();
            b.Property(x => x.Address).HasMaxLength(500);
            b.Property(x => x.ReceiptFooter).HasMaxLength(500);
            b.Property(x => x.WhatsAppPaymentTemplate).HasMaxLength(1000);
        });
        modelBuilder.Entity<Customer>(b =>
        {
            b.ToTable("Customers"); b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasMaxLength(20).ValueGeneratedNever();
            b.Property(x => x.Name).HasMaxLength(160).IsRequired();
            b.Property(x => x.Mobile).HasMaxLength(32).IsRequired();
            b.Property(x => x.SecondaryMobile).HasMaxLength(20);
            b.Property(x => x.AdditionalMobile).HasMaxLength(20);
            b.Property(x => x.PhotoUrl).HasMaxLength(500);
            b.Property(x => x.Address).HasMaxLength(500); b.Property(x => x.Notes).HasMaxLength(2000);
            b.Property(x => x.OpeningBalance).HasPrecision(18, 2);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(16);
            b.HasIndex(x => x.Mobile).IsUnique();
            b.HasOne<Shop>().WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<KhataTransaction>(b =>
        {
            b.ToTable("Transactions"); b.HasKey(x => x.Id);
            b.Property(x => x.Reference).HasMaxLength(32).IsRequired();
            b.Property(x => x.Notes).HasMaxLength(2000);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(16);
            b.HasIndex(x => new { x.ShopId, x.Reference }).IsUnique();
            b.HasIndex(x => new { x.ShopId, x.DateTimeUtc });
            b.HasOne(x => x.Customer).WithMany(x => x.Transactions).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne<Shop>().WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
            b.HasMany(x => x.Items).WithOne(x => x.Transaction).HasForeignKey(x => x.TransactionId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<TransactionItem>(b =>
        {
            b.ToTable("TransactionItems"); b.HasKey(x => x.Id);
            b.Property(x => x.Description).HasMaxLength(240).IsRequired();
            b.Property(x => x.Quantity).HasPrecision(18, 3); b.Property(x => x.UnitPrice).HasPrecision(18, 2);
        });
        modelBuilder.Entity<Payment>(b =>
        {
            b.ToTable("Payments"); b.HasKey(x => x.Id);
            b.Property(x => x.Reference).HasMaxLength(32).IsRequired();
            b.Property(x => x.Amount).HasPrecision(18, 2);
            b.Property(x => x.Method).HasConversion<string>().HasMaxLength(24);
            b.Property(x => x.ReferenceNumber).HasMaxLength(128); b.Property(x => x.Notes).HasMaxLength(2000);
            b.HasIndex(x => new { x.ShopId, x.Reference }).IsUnique();
            b.HasIndex(x => new { x.ShopId, x.DateTimeUtc });
            b.HasOne(x => x.Customer).WithMany(x => x.Payments).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne<Shop>().WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<Employee>(b =>
        {
            b.ToTable("Employees"); b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(160).IsRequired(); b.Property(x => x.UserName).HasMaxLength(80).IsRequired();
            b.Property(x => x.Mobile).HasMaxLength(32);
            b.Property(x => x.Role).HasConversion<string>().HasMaxLength(16);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(16);
            b.HasIndex(x => new { x.ShopId, x.UserName }).IsUnique();
            b.HasOne<Shop>().WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<UserAccount>(b =>
        {
            b.ToTable("UserAccounts"); b.HasKey(x => x.Id);
            b.Property(x => x.UserName).HasMaxLength(80).IsRequired();
            b.Property(x => x.PasswordHash).HasMaxLength(256).IsRequired();
            b.Property(x => x.Role).HasConversion<string>().HasMaxLength(16);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(16);
            b.HasIndex(x => new { x.ShopId, x.UserName }).IsUnique();
            b.HasOne<Shop>().WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<ShopNotification>(b =>
        {
            b.ToTable("Notifications"); b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(160).IsRequired();
            b.Property(x => x.Message).HasMaxLength(1000).IsRequired();
            b.HasIndex(x => new { x.ShopId, x.CreatedAtUtc });
            b.HasOne<Shop>().WithMany().HasForeignKey(x => x.ShopId).OnDelete(DeleteBehavior.Cascade);
        });
        foreach (var type in modelBuilder.Model.GetEntityTypes().Where(t => typeof(ShopKhata.Domain.Common.Entity).IsAssignableFrom(t.ClrType)))
        {
            modelBuilder.Entity(type.ClrType).Property<DateTime>("CreatedAtUtc").IsRequired();
            modelBuilder.Entity(type.ClrType).Property<DateTime>("UpdatedAtUtc").IsRequired();
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<ShopKhata.Domain.Common.Entity>())
        {
            if (entry.State == EntityState.Added) entry.Property(nameof(ShopKhata.Domain.Common.Entity.CreatedAtUtc)).CurrentValue = now;
            if (entry.State is EntityState.Added or EntityState.Modified)
                entry.Property(nameof(ShopKhata.Domain.Common.Entity.UpdatedAtUtc)).CurrentValue = now;
        }
        foreach (var entry in ChangeTracker.Entries<Customer>())
        {
            if (entry.State == EntityState.Added) entry.Entity.SetCreatedAtUtc(now);
            if (entry.State is EntityState.Added or EntityState.Modified) entry.Entity.SetUpdatedAtUtc(now);
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
