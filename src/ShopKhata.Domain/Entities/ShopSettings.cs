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
    public bool ShowMobile { get; private set; } = true;
    public bool ShowAddress { get; private set; } = true;
    public bool ShowFooter { get; private set; } = true;

    public void Update(string currency, string? address, string? receiptFooter,
        bool showMobile = true, bool showAddress = true, bool showFooter = true)
    {
        if (currency.Length != 3) throw new DomainException("Currency must be a three-letter ISO code.");
        Currency = currency.ToUpperInvariant();
        Address = address?.Trim();
        ReceiptFooter = receiptFooter?.Trim();
        ShowMobile = showMobile;
        ShowAddress = showAddress;
        ShowFooter = showFooter;
        Touch();
    }
}
