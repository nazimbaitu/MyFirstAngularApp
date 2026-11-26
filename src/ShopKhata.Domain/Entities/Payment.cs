using ShopKhata.Domain.Common;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Domain.Entities;

public sealed class Payment : Entity
{
    private Payment() { }
    public Payment(Guid shopId, Guid customerId, string reference, decimal amount, DateTime dateTimeUtc,
        PaymentMethod method, Guid createdBy, string? referenceNumber = null, string? notes = null)
    {
        if (amount <= 0) throw new DomainException("Payment amount must be greater than zero.");
        if (string.IsNullOrWhiteSpace(reference)) throw new DomainException("Payment reference is required.");
        ShopId = shopId; CustomerId = customerId; Reference = reference.Trim(); Amount = decimal.Round(amount, 2, MidpointRounding.AwayFromZero);
        DateTimeUtc = dateTimeUtc.Kind == DateTimeKind.Utc ? dateTimeUtc : dateTimeUtc.ToUniversalTime();
        Method = method; CreatedBy = createdBy; ReferenceNumber = referenceNumber?.Trim(); Notes = notes?.Trim();
    }
    public Guid ShopId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Customer? Customer { get; private set; }
    public string Reference { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public DateTime DateTimeUtc { get; private set; }
    public PaymentMethod Method { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? Notes { get; private set; }
    public Guid CreatedBy { get; private set; }
}
