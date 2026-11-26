using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ShopKhata.Infrastructure.Persistence;

public sealed class ShopKhataDbContextFactory : IDesignTimeDbContextFactory<ShopKhataDbContext>
{
    public ShopKhataDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ShopKhataDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=ShopKhataDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True")
            .Options;
        return new ShopKhataDbContext(options);
    }
}
