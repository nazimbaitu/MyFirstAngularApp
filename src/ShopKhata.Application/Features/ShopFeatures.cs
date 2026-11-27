using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopKhata.Application.Abstractions;
using ShopKhata.Application.Contracts;
using ShopKhata.Domain.Entities;
using ShopKhata.Domain.Enums;

namespace ShopKhata.Application.Features;

public sealed record GetCustomersQuery : IRequest<IReadOnlyList<CustomerDto>>;
public sealed record GetCustomerQuery(string Id) : IRequest<CustomerDetailDto?>;
public sealed record CreateCustomerCommand(string Name, string Mobile, string? SecondaryMobile,
    string? AdditionalMobile, string? Address, decimal OpeningBalance, string? Notes) : IRequest<CustomerDto>;
public sealed record UpdateCustomerCommand(string Id, string Name, string Mobile, string? SecondaryMobile,
    string? AdditionalMobile, string? Address, decimal OpeningBalance, string? Notes) : IRequest<CustomerDto>;
public sealed record UpdateCustomerPhotoCommand(string Id, string PhotoUrl) : IRequest<bool>;
public sealed record SetCustomerStatusCommand(string Id, RecordStatus Status) : IRequest<bool>;

public sealed class CustomerHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetCustomersQuery, IReadOnlyList<CustomerDto>>,
    IRequestHandler<GetCustomerQuery, CustomerDetailDto?>,
    IRequestHandler<CreateCustomerCommand, CustomerDto>,
    IRequestHandler<UpdateCustomerCommand, CustomerDto>,
    IRequestHandler<UpdateCustomerPhotoCommand, bool>,
    IRequestHandler<SetCustomerStatusCommand, bool>
{
    public async Task<IReadOnlyList<CustomerDto>> Handle(GetCustomersQuery request, CancellationToken ct) =>
        await db.Customers.AsNoTracking().Where(x => x.ShopId == current.ShopId)
            .OrderBy(x => x.Name).Select(x => Map(x)).ToListAsync(ct);
    public async Task<CustomerDetailDto?> Handle(GetCustomerQuery request, CancellationToken ct)
    {
        var entity = await db.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.ShopId == current.ShopId && x.Id == request.Id, ct);
        return entity is null ? null : MapDetail(entity);
    }
    public async Task<CustomerDto> Handle(CreateCustomerCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Mobile))
            throw new ArgumentException("Customer mobile is required.");
        var mobile = request.Mobile.Trim();
        if (await db.Customers.AnyAsync(x => x.Mobile == mobile, ct))
            throw new ArgumentException("This mobile number is already registered.");
        var entity = new Customer(await NextCustomerId(ct), RequireShop(), request.Name, mobile,
            request.OpeningBalance, request.Address, request.Notes, request.SecondaryMobile, request.AdditionalMobile);
        db.Customers.Add(entity);
        await db.SaveChangesAsync(ct);
        return Map(entity);
    }
    public async Task<CustomerDto> Handle(UpdateCustomerCommand request, CancellationToken ct)
    {
        var entity = await db.Customers.FirstOrDefaultAsync(x => x.ShopId == current.ShopId && x.Id == request.Id, ct)
            ?? throw new KeyNotFoundException("Customer not found.");
        if (string.IsNullOrWhiteSpace(request.Mobile))
            throw new ArgumentException("Customer mobile is required.");
        var mobile = request.Mobile.Trim();
        if (await db.Customers.AnyAsync(x => x.Id != request.Id && x.Mobile == mobile, ct))
            throw new ArgumentException("This mobile number is already registered.");
        entity.Update(request.Name, mobile, request.SecondaryMobile, request.AdditionalMobile,
            request.Address, request.OpeningBalance, request.Notes);
        await db.SaveChangesAsync(ct);
        return Map(entity);
    }
    public async Task<bool> Handle(UpdateCustomerPhotoCommand request, CancellationToken ct)
    {
        var entity = await db.Customers.FirstOrDefaultAsync(x => x.ShopId == current.ShopId && x.Id == request.Id, ct);
        if (entity is null) return false;
        entity.UpdatePhoto(request.PhotoUrl);
        await db.SaveChangesAsync(ct);
        return true;
    }
    public async Task<bool> Handle(SetCustomerStatusCommand request, CancellationToken ct)
    {
        var entity = await db.Customers.FirstOrDefaultAsync(x => x.ShopId == current.ShopId && x.Id == request.Id, ct);
        if (entity is null) return false;
        entity.SetStatus(request.Status); await db.SaveChangesAsync(ct); return true;
    }
    private Guid RequireShop() => current.ShopId ?? throw new UnauthorizedAccessException("An authenticated shop is required.");
    private async Task<string> NextCustomerId(CancellationToken ct)
    {
        var lastId = await db.Customers.OrderByDescending(x => x.Id).Select(x => x.Id).FirstOrDefaultAsync(ct);
        if (lastId is null) return "NK000001";
        if (!lastId.StartsWith("NK", StringComparison.Ordinal) ||
            !int.TryParse(lastId.AsSpan(2), System.Globalization.NumberStyles.None,
                System.Globalization.CultureInfo.InvariantCulture, out var lastNumber))
            throw new InvalidOperationException($"Customer ID '{lastId}' is not in the expected NK-number format.");
        return $"NK{checked(lastNumber + 1):D6}";
    }
    private static CustomerDto Map(Customer x) =>
        new(x.Id, x.Name, x.Mobile, x.SecondaryMobile, x.AdditionalMobile, x.PhotoUrl,
            x.Address, x.OpeningBalance, x.Notes, x.Status, x.CreatedAtUtc);
    private static CustomerDetailDto MapDetail(Customer x) =>
        new(x.Id, x.Name, x.Mobile, x.SecondaryMobile, x.AdditionalMobile, x.PhotoUrl,
            x.Address, x.OpeningBalance, x.Notes, x.Status, x.CreatedAtUtc, x.UpdatedAtUtc);
}

public sealed record GetTransactionsQuery(string? CustomerId = null, DateOnly? From = null, DateOnly? To = null)
    : IRequest<IReadOnlyList<TransactionDto>>;
public sealed record CreateTransactionCommand(string CustomerId, DateTime? DateTimeUtc, IReadOnlyList<TransactionItemDto> Items, string? Notes)
    : IRequest<TransactionDto>;
public sealed record CancelTransactionCommand(Guid Id) : IRequest<bool>;
public sealed record RestoreTransactionCommand(Guid Id) : IRequest<bool>;

public sealed class TransactionHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetTransactionsQuery, IReadOnlyList<TransactionDto>>,
    IRequestHandler<CreateTransactionCommand, TransactionDto>,
    IRequestHandler<CancelTransactionCommand, bool>,
    IRequestHandler<RestoreTransactionCommand, bool>
{
    public async Task<IReadOnlyList<TransactionDto>> Handle(GetTransactionsQuery request, CancellationToken ct)
    {
        var query = db.Transactions.AsNoTracking().Include(x => x.Items)
            .Where(x => x.ShopId == current.ShopId);
        if (request.CustomerId is { } customerId) query = query.Where(x => x.CustomerId == customerId);
        if (request.From is { } from) query = query.Where(x => x.DateTimeUtc >= from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
        if (request.To is { } to) query = query.Where(x => x.DateTimeUtc < to.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
        var list = await query.OrderByDescending(x => x.DateTimeUtc).ToListAsync(ct);
        return list.Select(Map).ToList();
    }
    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken ct)
    {
        if (request.Items.Count == 0) throw new ArgumentException("At least one transaction item is required.");
        if (!await db.Customers.AnyAsync(x => x.Id == request.CustomerId && x.ShopId == current.ShopId, ct))
            throw new KeyNotFoundException("Customer not found.");
        var entity = new KhataTransaction(current.ShopId!.Value, request.CustomerId, $"KH-{Guid.NewGuid():N}"[..15],
            request.DateTimeUtc ?? DateTime.UtcNow, current.UserId ?? Guid.Empty, request.Notes);
        foreach (var item in request.Items) entity.AddItem(item.Description, item.Quantity, item.UnitPrice);
        db.Transactions.Add(entity); await db.SaveChangesAsync(ct);
        return Map(entity);
    }
    public async Task<bool> Handle(CancelTransactionCommand request, CancellationToken ct)
    {
        var entity = await db.Transactions.FirstOrDefaultAsync(x => x.Id == request.Id && x.ShopId == current.ShopId, ct);
        if (entity is null) return false;
        entity.Cancel(); await db.SaveChangesAsync(ct); return true;
    }
    public async Task<bool> Handle(RestoreTransactionCommand request, CancellationToken ct)
    {
        var entity = await db.Transactions.FirstOrDefaultAsync(x => x.Id == request.Id && x.ShopId == current.ShopId, ct);
        if (entity is null) return false;
        entity.Restore(); await db.SaveChangesAsync(ct); return true;
    }
    private static TransactionDto Map(KhataTransaction x) => new(x.Id, x.Reference, x.CustomerId, x.DateTimeUtc,
        x.Items.Select(i => new TransactionItemDto(i.Description, i.Quantity, i.UnitPrice, i.Total)).ToList(),
        x.Total, x.Notes, x.CreatedBy, x.Status, x.Reversed);
}

public sealed record GetPaymentsQuery(string? CustomerId = null) : IRequest<IReadOnlyList<PaymentDto>>;
public sealed record CreatePaymentCommand(string CustomerId, decimal Amount, DateTime? DateTimeUtc, PaymentMethod Method,
    string? ReferenceNumber, string? Notes) : IRequest<PaymentDto>;
public sealed class PaymentHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetPaymentsQuery, IReadOnlyList<PaymentDto>>,
    IRequestHandler<CreatePaymentCommand, PaymentDto>
{
    public async Task<IReadOnlyList<PaymentDto>> Handle(GetPaymentsQuery request, CancellationToken ct)
    {
        var query = db.Payments.AsNoTracking().Where(x => x.ShopId == current.ShopId);
        if (request.CustomerId is { } id) query = query.Where(x => x.CustomerId == id);
        return await query.OrderByDescending(x => x.DateTimeUtc)
            .Select(x => new PaymentDto(x.Id, x.Reference, x.CustomerId, x.Amount, x.DateTimeUtc, x.Method, x.ReferenceNumber, x.Notes, x.CreatedBy))
            .ToListAsync(ct);
    }
    public async Task<PaymentDto> Handle(CreatePaymentCommand request, CancellationToken ct)
    {
        if (!await db.Customers.AnyAsync(x => x.Id == request.CustomerId && x.ShopId == current.ShopId, ct))
            throw new KeyNotFoundException("Customer not found.");
        var payment = new Payment(current.ShopId!.Value, request.CustomerId, $"PM-{Guid.NewGuid():N}"[..15],
            request.Amount, request.DateTimeUtc ?? DateTime.UtcNow, request.Method, current.UserId ?? Guid.Empty,
            request.ReferenceNumber, request.Notes);
        db.Payments.Add(payment); await db.SaveChangesAsync(ct);
        return new PaymentDto(payment.Id, payment.Reference, payment.CustomerId, payment.Amount, payment.DateTimeUtc,
            payment.Method, payment.ReferenceNumber, payment.Notes, payment.CreatedBy);
    }
}

public sealed record GetEmployeesQuery : IRequest<IReadOnlyList<EmployeeDto>>;
public sealed record CreateEmployeeCommand(string Name, string UserName, string? Mobile, EmployeeRole Role, string Password)
    : IRequest<EmployeeDto>;
public sealed record SetEmployeeStatusCommand(Guid Id, RecordStatus Status) : IRequest<bool>;
public sealed class EmployeeHandlers(IApplicationDbContext db, ICurrentUser current, ICredentialVerifier passwords) :
    IRequestHandler<GetEmployeesQuery, IReadOnlyList<EmployeeDto>>,
    IRequestHandler<CreateEmployeeCommand, EmployeeDto>,
    IRequestHandler<SetEmployeeStatusCommand, bool>
{
    public async Task<IReadOnlyList<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken ct) =>
        await db.Employees.AsNoTracking().Where(x => x.ShopId == current.ShopId).OrderBy(x => x.Name)
            .Select(x => new EmployeeDto(x.Id, x.Name, x.UserName, x.Mobile, x.Role, x.Status, x.CreatedAtUtc)).ToListAsync(ct);
    public async Task<EmployeeDto> Handle(CreateEmployeeCommand request, CancellationToken ct)
    {
        if (request.Password.Length < 12)
            throw new ArgumentException("Employee passwords must contain at least 12 characters.");
        if (await db.Employees.AnyAsync(x => x.ShopId == current.ShopId && x.UserName == request.UserName.ToLower(), ct) ||
            await db.UserAccounts.AnyAsync(x => x.ShopId == current.ShopId && x.UserName == request.UserName.ToLower(), ct))
            throw new ArgumentException("Username is already in use.");
        var employee = new Employee(current.ShopId ?? throw new UnauthorizedAccessException(), request.Name, request.UserName, request.Role, request.Mobile);
        db.Employees.Add(employee);
        db.UserAccounts.Add(new UserAccount(employee.ShopId, employee.UserName, passwords.Hash(request.Password), employee.Role));
        await db.SaveChangesAsync(ct);
        return new EmployeeDto(employee.Id, employee.Name, employee.UserName, employee.Mobile, employee.Role, employee.Status, employee.CreatedAtUtc);
    }
    public async Task<bool> Handle(SetEmployeeStatusCommand request, CancellationToken ct)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(x => x.Id == request.Id && x.ShopId == current.ShopId, ct);
        if (employee is null) return false;
        employee.SetStatus(request.Status);
        var account = await db.UserAccounts.FirstOrDefaultAsync(x => x.ShopId == current.ShopId && x.UserName == employee.UserName, ct);
        account?.SetStatus(request.Status);
        await db.SaveChangesAsync(ct); return true;
    }
}

public sealed record GetMyProfileQuery : IRequest<EmployeeDto>;
public sealed record UpdateMyProfileCommand(string Name, string? Mobile) : IRequest<EmployeeDto>;
public sealed class ProfileHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetMyProfileQuery, EmployeeDto>,
    IRequestHandler<UpdateMyProfileCommand, EmployeeDto>
{
    public async Task<EmployeeDto> Handle(GetMyProfileQuery request, CancellationToken ct) =>
        Map(await FindEmployee(ct));

    public async Task<EmployeeDto> Handle(UpdateMyProfileCommand request, CancellationToken ct)
    {
        var employee = await FindEmployee(ct);
        employee.UpdateProfile(request.Name, request.Mobile);
        await db.SaveChangesAsync(ct);
        return Map(employee);
    }

    private async Task<Employee> FindEmployee(CancellationToken ct)
    {
        var user = await db.UserAccounts.AsNoTracking().FirstOrDefaultAsync(
            x => x.ShopId == current.ShopId && x.Id == current.UserId, ct)
            ?? throw new KeyNotFoundException("User account not found.");
        return await db.Employees.FirstOrDefaultAsync(
            x => x.ShopId == current.ShopId && x.UserName == user.UserName, ct)
            ?? throw new KeyNotFoundException("Employee profile not found.");
    }

    private static EmployeeDto Map(Employee x) =>
        new(x.Id, x.Name, x.UserName, x.Mobile, x.Role, x.Status, x.CreatedAtUtc);
}

public sealed record GetShopSettingsQuery : IRequest<ShopSettingsDto>;
public sealed record UpdateShopSettingsCommand(string ShopName, string? Phone, string Currency, string? Address,
    string? ReceiptFooter, string? WhatsAppPaymentTemplate) : IRequest<ShopSettingsDto>;
public sealed class SettingsHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetShopSettingsQuery, ShopSettingsDto>,
    IRequestHandler<UpdateShopSettingsCommand, ShopSettingsDto>
{
    public async Task<ShopSettingsDto> Handle(GetShopSettingsQuery request, CancellationToken ct)
    {
        var shop = await db.Shops.Include(x => x.Settings).FirstOrDefaultAsync(x => x.Id == current.ShopId, ct)
            ?? throw new KeyNotFoundException("Shop not found.");
        return Map(shop);
    }
    public async Task<ShopSettingsDto> Handle(UpdateShopSettingsCommand request, CancellationToken ct)
    {
        var shop = await db.Shops.Include(x => x.Settings).FirstOrDefaultAsync(x => x.Id == current.ShopId, ct)
            ?? throw new KeyNotFoundException("Shop not found.");
        if (string.IsNullOrWhiteSpace(request.ShopName)) throw new ArgumentException("Shop name is required.");
        shop.UpdateDetails(request.ShopName, request.Phone);
        shop.EnsureSettings();
        shop.Settings!.Update(request.Currency, request.Address, request.ReceiptFooter, request.WhatsAppPaymentTemplate);
        await db.SaveChangesAsync(ct); return Map(shop);
    }
    private static ShopSettingsDto Map(Shop s) => new(s.Name, s.Phone, s.Settings?.Currency ?? "INR",
        s.Settings?.Address, s.Settings?.ReceiptFooter, s.Settings?.WhatsAppPaymentTemplate);
}

public sealed record GetNotificationsQuery : IRequest<IReadOnlyList<NotificationDto>>;
public sealed record MarkNotificationReadCommand(Guid Id) : IRequest<bool>;
public sealed class NotificationHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetNotificationsQuery, IReadOnlyList<NotificationDto>>,
    IRequestHandler<MarkNotificationReadCommand, bool>
{
    public async Task<IReadOnlyList<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken ct) =>
        await db.Notifications.AsNoTracking().Where(x => x.ShopId == current.ShopId).OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new NotificationDto(x.Id, x.Title, x.Message, x.IsRead, x.CreatedAtUtc)).ToListAsync(ct);
    public async Task<bool> Handle(MarkNotificationReadCommand request, CancellationToken ct)
    {
        var entity = await db.Notifications.FirstOrDefaultAsync(x => x.Id == request.Id && x.ShopId == current.ShopId, ct);
        if (entity is null) return false;
        entity.MarkRead(); await db.SaveChangesAsync(ct); return true;
    }
}

public sealed record GetOutstandingQuery : IRequest<IReadOnlyList<OutstandingDto>>;
public sealed record GetDailySummaryQuery(DateOnly? Date = null) : IRequest<ReportSummaryDto>;
public sealed record GetMonthlySummaryQuery(int Year, int Month) : IRequest<ReportSummaryDto>;
public sealed class ReportHandlers(IApplicationDbContext db, ICurrentUser current) :
    IRequestHandler<GetOutstandingQuery, IReadOnlyList<OutstandingDto>>,
    IRequestHandler<GetDailySummaryQuery, ReportSummaryDto>,
    IRequestHandler<GetMonthlySummaryQuery, ReportSummaryDto>
{
    public async Task<IReadOnlyList<OutstandingDto>> Handle(GetOutstandingQuery request, CancellationToken ct)
    {
        var customers = await db.Customers.AsNoTracking().Where(x => x.ShopId == current.ShopId && x.Status == RecordStatus.Active)
            .Include(x => x.Transactions).Include(x => x.Payments).ToListAsync(ct);
        return customers.Select(c => new OutstandingDto(c.Id, c.Name, c.Mobile,
            c.OpeningBalance + c.Transactions.Where(t => t.Status == TransactionStatus.Completed).Sum(t => t.Total)
            - c.Payments.Sum(p => p.Amount))).ToList();
    }
    public async Task<ReportSummaryDto> Handle(GetDailySummaryQuery request, CancellationToken ct)
    {
        var date = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var start = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = start.AddDays(1);
        var sales = await db.Transactions.Where(x => x.ShopId == current.ShopId && x.Status == TransactionStatus.Completed && x.DateTimeUtc >= start && x.DateTimeUtc < end)
            .Select(x => (decimal?)x.Items.Sum(i => i.Quantity * i.UnitPrice)).SumAsync(ct) ?? 0;
        var payments = await db.Payments.Where(x => x.ShopId == current.ShopId && x.DateTimeUtc >= start && x.DateTimeUtc < end)
            .Select(x => (decimal?)x.Amount).SumAsync(ct) ?? 0;
        var count = await db.Transactions.CountAsync(x => x.ShopId == current.ShopId && x.DateTimeUtc >= start && x.DateTimeUtc < end, ct);
        var customers = await db.Customers.CountAsync(x => x.ShopId == current.ShopId && x.Status == RecordStatus.Active, ct);
        return new ReportSummaryDto(date, sales, payments, count, customers);
    }

    public async Task<ReportSummaryDto> Handle(GetMonthlySummaryQuery request, CancellationToken ct)
    {
        var start = new DateTime(request.Year, request.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);
        var sales = await db.Transactions.Where(x => x.ShopId == current.ShopId && x.Status == TransactionStatus.Completed && x.DateTimeUtc >= start && x.DateTimeUtc < end)
            .Select(x => (decimal?)x.Items.Sum(i => i.Quantity * i.UnitPrice)).SumAsync(ct) ?? 0;
        var payments = await db.Payments.Where(x => x.ShopId == current.ShopId && x.DateTimeUtc >= start && x.DateTimeUtc < end)
            .Select(x => (decimal?)x.Amount).SumAsync(ct) ?? 0;
        var count = await db.Transactions.CountAsync(x => x.ShopId == current.ShopId && x.DateTimeUtc >= start && x.DateTimeUtc < end, ct);
        var customers = await db.Customers.CountAsync(x => x.ShopId == current.ShopId && x.Status == RecordStatus.Active, ct);
        return new ReportSummaryDto(DateOnly.FromDateTime(start), sales, payments, count, customers);
    }
}

public sealed record LoginCommand(string UserName, string Password) : IRequest<AuthDto>;
public sealed class LoginHandler(IApplicationDbContext db, ICredentialVerifier credentials, ITokenService tokens)
    : IRequestHandler<LoginCommand, AuthDto>
{
    public async Task<AuthDto> Handle(LoginCommand request, CancellationToken ct)
    {
        var userName = request.UserName.Trim().ToLowerInvariant();
        var user = await db.UserAccounts.AsNoTracking().FirstOrDefaultAsync(x =>
            x.UserName == userName && x.Status == RecordStatus.Active, ct);
        if (user is null || !credentials.Verify(user.PasswordHash, request.Password))
            throw new UnauthorizedAccessException("Invalid username or password.");
        return new AuthDto(tokens.CreateToken(user), user.Id, user.ShopId, user.UserName, user.Role);
    }
}
