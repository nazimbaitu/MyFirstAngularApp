using ShopKhata.Domain.Common;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Domain.Entities;

public sealed class Employee : Entity
{
    private Employee() { }
    public Employee(Guid shopId, string name, string userName, EmployeeRole role, string? mobile = null)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(userName))
            throw new DomainException("Employee name and username are required.");
        ShopId = shopId; Name = name.Trim(); UserName = userName.Trim().ToLowerInvariant();
        Role = role; Mobile = mobile?.Trim();
    }
    public Guid ShopId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string UserName { get; private set; } = string.Empty;
    public string? Mobile { get; private set; }
    public EmployeeRole Role { get; private set; }
    public RecordStatus Status { get; private set; } = RecordStatus.Active;
    public void UpdateProfile(string name, string? mobile)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Employee name is required.");
        Name = name.Trim();
        Mobile = mobile?.Trim();
        Touch();
    }
    public void SetStatus(RecordStatus status) { Status = status; Touch(); }
}
