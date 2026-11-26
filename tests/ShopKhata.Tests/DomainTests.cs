using ShopKhata.Domain.Common;
using ShopKhata.Domain.Entities;
using ShopKhata.Domain.ValueObjects;

namespace ShopKhata.Tests;

public sealed class DomainTests
{
    [Fact]
    public void Money_rounds_and_rejects_negative_values()
    {
        Assert.Equal(12.35m, new Money(12.345m).Amount);
        Assert.Throws<DomainException>(() => new Money(-0.01m));
    }

    [Fact]
    public void Customer_requires_identity_and_nonnegative_opening_balance()
    {
        Assert.Throws<DomainException>(() => new Customer(Guid.NewGuid(), "", "5551234"));
        Assert.Throws<DomainException>(() => new Customer(Guid.NewGuid(), "Ada", "5551234", -1));
    }

    [Fact]
    public void Transaction_requires_positive_item_quantity_and_cannot_be_cancelled_twice()
    {
        var transaction = new KhataTransaction(Guid.NewGuid(), Guid.NewGuid(), "KH-001", DateTime.UtcNow, Guid.NewGuid());
        Assert.Throws<DomainException>(() => transaction.AddItem("rice", 0, 10));
        transaction.AddItem("rice", 2, 1.25m);
        Assert.Equal(2.50m, transaction.Total);
        transaction.Cancel();
        Assert.Throws<DomainException>(() => transaction.Cancel());
    }
}
