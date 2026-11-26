using System.Security.Claims;
using ShopKhata.Application.Abstractions;

namespace ShopKhata.WebApi.Authentication;

public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid? ShopId => Guid.TryParse(accessor.HttpContext?.User.FindFirstValue("shop_id"), out var id) ? id : null;
    public Guid? UserId => Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
