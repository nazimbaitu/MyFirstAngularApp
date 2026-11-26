using ShopKhata.Domain.Common;

namespace ShopKhata.Domain.Entities;

public sealed class TransactionItem : Entity
{
    private TransactionItem() { }
    internal TransactionItem(Guid transactionId, string description, decimal quantity, decimal unitPrice)
    {
        if (string.IsNullOrWhiteSpace(description)) throw new DomainException("Item description is required.");
        if (quantity <= 0 || unitPrice < 0) throw new DomainException("Quantity must be positive and price cannot be negative.");
        TransactionId = transactionId; Description = description.Trim();
        Quantity = quantity; UnitPrice = unitPrice;
    }
    public Guid TransactionId { get; private set; }
    public KhataTransaction? Transaction { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal Total => decimal.Round(Quantity * UnitPrice, 2, MidpointRounding.AwayFromZero);
}
