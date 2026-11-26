using ShopKhata.Domain.Common;

namespace ShopKhata.Domain.Entities;

public sealed class ShopNotification : Entity
{
    private ShopNotification() { }
    public ShopNotification(Guid shopId, string title, string message)
    {
        ShopId = shopId; Title = title; Message = message;
    }
    public Guid ShopId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }
    public void MarkRead() { IsRead = true; Touch(); }
}
