using ShopKhata.Domain.Common;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Domain.Entities;

public sealed class KhataTransaction : Entity
{
    private KhataTransaction() { }
    public KhataTransaction(Guid shopId, string customerId, string reference, DateTime dateTimeUtc, Guid createdBy, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(reference)) throw new DomainException("Transaction reference is required.");
        ShopId = shopId; CustomerId = customerId; Reference = reference.Trim();
        DateTimeUtc = dateTimeUtc.Kind == DateTimeKind.Utc ? dateTimeUtc : dateTimeUtc.ToUniversalTime();
        CreatedBy = createdBy; Notes = notes?.Trim();
    }

    public Guid ShopId { get; private set; }
    public string CustomerId { get; private set; } = string.Empty;
    public Customer? Customer { get; private set; }
    public string Reference { get; private set; } = string.Empty;
    public DateTime DateTimeUtc { get; private set; }
    public string? Notes { get; private set; }
    public Guid CreatedBy { get; private set; }
    public TransactionStatus Status { get; private set; } = TransactionStatus.Completed;
    public bool Reversed { get; private set; }
    public decimal Total => Items.Sum(item => item.Total);
    public ICollection<TransactionItem> Items { get; private set; } = new List<TransactionItem>();

    public void AddItem(string description, decimal quantity, decimal unitPrice)
    {
        if (Status != TransactionStatus.Completed || Reversed) throw new DomainException("Cannot edit a cancelled transaction.");
        Items.Add(new TransactionItem(Id, description, quantity, unitPrice));
        Touch();
    }

    public void Cancel()
    {
        if (Status == TransactionStatus.Cancelled) throw new DomainException("Transaction is already cancelled.");
        Status = TransactionStatus.Cancelled; Reversed = true; Touch();
    }
}
