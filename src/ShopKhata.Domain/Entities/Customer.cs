using ShopKhata.Domain.Common;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Domain.Entities;

public sealed class Customer : Entity
{
    private Customer() { }
    public Customer(Guid shopId, string name, string mobile, decimal openingBalance = 0, string? address = null, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Customer name is required.");
        if (string.IsNullOrWhiteSpace(mobile)) throw new DomainException("Customer mobile is required.");
        if (openingBalance < 0) throw new DomainException("Opening balance cannot be negative.");
        ShopId = shopId;
        Name = name.Trim();
        Mobile = mobile.Trim();
        OpeningBalance = openingBalance;
        Address = address?.Trim();
        Notes = notes?.Trim();
    }

    public Guid ShopId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Mobile { get; private set; } = string.Empty;
    public string? Address { get; private set; }
    public decimal OpeningBalance { get; private set; }
    public string? Notes { get; private set; }
    public RecordStatus Status { get; private set; } = RecordStatus.Active;
    public ICollection<KhataTransaction> Transactions { get; private set; } = new List<KhataTransaction>();
    public ICollection<Payment> Payments { get; private set; } = new List<Payment>();

    public void Update(string name, string mobile, string? address, decimal openingBalance, string? notes)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(mobile))
            throw new DomainException("Customer name and mobile are required.");
        if (openingBalance < 0) throw new DomainException("Opening balance cannot be negative.");
        Name = name.Trim(); Mobile = mobile.Trim(); Address = address?.Trim();
        OpeningBalance = openingBalance; Notes = notes?.Trim(); Touch();
    }

    public void SetStatus(RecordStatus status) { Status = status; Touch(); }
}
