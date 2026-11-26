using ShopKhata.Domain.Common;

namespace ShopKhata.Domain.Entities;

public sealed class Shop : Entity
{
    private Shop() { }

    public Shop(string name, string? phone = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Shop name is required.");
        Name = name.Trim();
        Phone = phone?.Trim();
    }

    public string Name { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public ShopSettings? Settings { get; private set; }

    public void UpdateDetails(string name, string? phone)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Shop name is required.");
        Name = name.Trim();
        Phone = phone?.Trim();
        Touch();
    }

    public void EnsureSettings()
    {
        Settings ??= new ShopSettings(Id);
        Touch();
    }
}
