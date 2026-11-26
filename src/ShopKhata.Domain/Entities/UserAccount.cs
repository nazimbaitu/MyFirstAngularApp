using ShopKhata.Domain.Common;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Domain.Entities;

public sealed class UserAccount : Entity
{
    private UserAccount() { }
    public UserAccount(Guid shopId, string userName, string passwordHash, EmployeeRole role)
    {
        ShopId = shopId; UserName = userName.Trim().ToLowerInvariant();
        PasswordHash = passwordHash; Role = role;
    }
    public Guid ShopId { get; private set; }
    public string UserName { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public EmployeeRole Role { get; private set; }
    public RecordStatus Status { get; private set; } = RecordStatus.Active;
    public void SetPasswordHash(string hash) => PasswordHash = hash;
    public void SetStatus(RecordStatus status) => Status = status;
}
