using ShopKhata.Domain.Enums;

namespace ShopKhata.Application.Contracts;

public sealed record CustomerDto(string Id, string Name, string Mobile, string? SecondaryMobile,
    string? AdditionalMobile, string? PhotoUrl, string? Address, decimal OpeningBalance,
    string? Notes, RecordStatus Status, DateTime CreatedAtUtc);
public sealed record CustomerDetailDto(string Id, string Name, string Mobile, string? SecondaryMobile,
    string? AdditionalMobile, string? PhotoUrl, string? Address, decimal OpeningBalance,
    string? Notes, RecordStatus Status, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
public sealed record TransactionItemDto(string Description, decimal Quantity, decimal UnitPrice, decimal Total);
public sealed record TransactionDto(Guid Id, string Reference, string CustomerId, DateTime DateTimeUtc,
    IReadOnlyList<TransactionItemDto> Items, decimal Total, string? Notes, Guid CreatedBy,
    TransactionStatus Status, bool Reversed);
public sealed record PaymentDto(Guid Id, string Reference, string CustomerId, decimal Amount,
    DateTime DateTimeUtc, PaymentMethod Method, string? ReferenceNumber, string? Notes, Guid CreatedBy);
public sealed record EmployeeDto(Guid Id, string Name, string UserName, string? Mobile, EmployeeRole Role,
    RecordStatus Status, DateTime CreatedAtUtc);
public sealed record ShopSettingsDto(string ShopName, string? Phone, string Currency, string? Address,
    string? ReceiptFooter, string? WhatsAppPaymentTemplate);
public sealed record NotificationDto(Guid Id, string Title, string Message, bool IsRead, DateTime CreatedAtUtc);
public sealed record OutstandingDto(string CustomerId, string CustomerName, string Mobile, decimal Balance);
public sealed record ReportSummaryDto(DateOnly Date, decimal Sales, decimal Payments, int Transactions, int Customers);
public sealed record AuthDto(string AccessToken, Guid UserId, Guid ShopId, string UserName, EmployeeRole Role);
