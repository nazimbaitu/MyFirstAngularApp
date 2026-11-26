namespace ShopKhata.Application.Abstractions;

public interface ICurrentUser
{
    Guid? ShopId { get; }
    Guid? UserId { get; }
}
