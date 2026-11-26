using ShopKhata.Domain.Enums;

namespace ShopKhata.Application.Contracts;

public sealed record CustomerDto(Guid Id, string Name, string Mobile, string? Address, decimal OpeningBalance,
    string? Notes, RecordStatus Status, DateTime CreatedAtUtc);
public sealed record TransactionItemDto(string Description, decimal Quantity, decimal UnitPrice, decimal Total);
public sealed record TransactionDto(Guid Id, string Reference, Guid CustomerId, DateTime DateTimeUtc,
    IReadOnlyList<TransactionItemDto> Items, decimal Total, string? Notes, Guid CreatedBy,
    TransactionStatus Status, bool Reversed);
public sealed record PaymentDto(Guid Id, string Reference, Guid CustomerId, decimal Amount,
    DateTime DateTimeUtc, PaymentMethod Method, string? ReferenceNumber, string? Notes, Guid CreatedBy);
public sealed record EmployeeDto(Guid Id, string Name, string UserName, string? Mobile, EmployeeRole Role,
    RecordStatus Status, DateTime CreatedAtUtc);
public sealed record ShopSettingsDto(string ShopName, string? Phone, string Currency, string? Address, string? ReceiptFooter,
    bool ShowMobile, bool ShowAddress, bool ShowFooter);
public sealed record NotificationDto(Guid Id, string Title, string Message, bool IsRead, DateTime CreatedAtUtc);
public sealed record OutstandingDto(Guid CustomerId, string CustomerName, string Mobile, decimal Balance);
public sealed record ReportSummaryDto(DateOnly Date, decimal Sales, decimal Payments, int Transactions, int Customers);
public sealed record AuthDto(string AccessToken, Guid UserId, Guid ShopId, string UserName, EmployeeRole Role);
