using ShopKhata.Domain.Common;

namespace ShopKhata.Domain.Entities;

public sealed class ShopSettings : Entity
{
    private ShopSettings() { }
    public ShopSettings(Guid shopId) => ShopId = shopId;
    public Guid ShopId { get; private set; }
    public string Currency { get; private set; } = "INR";
    public string? Address { get; private set; }
    public string? ReceiptFooter { get; private set; }

    public void Update(string currency, string? address, string? receiptFooter)
    {
        if (currency.Length != 3) throw new DomainException("Currency must be a three-letter ISO code.");
        Currency = currency.ToUpperInvariant();
        Address = address?.Trim();
        ReceiptFooter = receiptFooter?.Trim();
        Touch();
    }
}
