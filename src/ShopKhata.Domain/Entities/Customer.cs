using ShopKhata.Domain.Common;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Domain.Entities;

public sealed class Customer
{
    private Customer() { }
    public Customer(string id, Guid shopId, string name, string mobile, decimal openingBalance = 0,
        string? address = null, string? notes = null, string? secondaryMobile = null, string? additionalMobile = null)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new DomainException("Customer ID is required.");
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Customer name is required.");
        if (string.IsNullOrWhiteSpace(mobile)) throw new DomainException("Customer mobile is required.");
        if (openingBalance < 0) throw new DomainException("Opening balance cannot be negative.");
        ValidateContactNumber(secondaryMobile);
        ValidateContactNumber(additionalMobile);
        var normalizedId = id.Trim();
        if (normalizedId.Length > 20) throw new DomainException("Customer ID cannot exceed 20 characters.");
        Id = normalizedId;
        ShopId = shopId;
        Name = name.Trim();
        Mobile = mobile.Trim();
        OpeningBalance = openingBalance;
        Address = address?.Trim();
        Notes = notes?.Trim();
        SecondaryMobile = secondaryMobile?.Trim();
        AdditionalMobile = additionalMobile?.Trim();
    }

    public string Id { get; private set; } = string.Empty;
    public Guid ShopId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Mobile { get; private set; } = string.Empty;
    public string? SecondaryMobile { get; private set; }
    public string? AdditionalMobile { get; private set; }
    public string? PhotoUrl { get; private set; }
    public string? Address { get; private set; }
    public decimal OpeningBalance { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;
    public RecordStatus Status { get; private set; } = RecordStatus.Active;
    public ICollection<KhataTransaction> Transactions { get; private set; } = new List<KhataTransaction>();
    public ICollection<Payment> Payments { get; private set; } = new List<Payment>();

    public void Update(string name, string mobile, string? secondaryMobile, string? additionalMobile,
        string? address, decimal openingBalance, string? notes)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(mobile))
            throw new DomainException("Customer name and mobile are required.");
        if (openingBalance < 0) throw new DomainException("Opening balance cannot be negative.");
        ValidateContactNumber(secondaryMobile);
        ValidateContactNumber(additionalMobile);
        Name = name.Trim(); Mobile = mobile.Trim(); Address = address?.Trim();
        SecondaryMobile = secondaryMobile?.Trim(); AdditionalMobile = additionalMobile?.Trim();
        OpeningBalance = openingBalance; Notes = notes?.Trim(); Touch();
    }

    public void UpdatePhoto(string photoUrl)
    {
        if (string.IsNullOrWhiteSpace(photoUrl) || photoUrl.Length > 500)
            throw new DomainException("A valid customer photo URL is required.");
        PhotoUrl = photoUrl;
        Touch();
    }

    public void SetStatus(RecordStatus status) { Status = status; Touch(); }

    public void SetCreatedAtUtc(DateTime value) => CreatedAtUtc = value;
    public void SetUpdatedAtUtc(DateTime value) => UpdatedAtUtc = value;

    private void Touch() => UpdatedAtUtc = DateTime.UtcNow;

    private static void ValidateContactNumber(string? mobile)
    {
        if (mobile?.Length > 20) throw new DomainException("Additional mobile numbers cannot exceed 20 characters.");
    }
}
