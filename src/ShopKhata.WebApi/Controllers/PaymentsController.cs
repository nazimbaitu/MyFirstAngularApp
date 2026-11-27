using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;
using ShopKhata.Domain.Enums;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public sealed class PaymentsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<PaymentDto>> List([FromQuery] string? customerId, CancellationToken ct) =>
        mediator.Send(new GetPaymentsQuery(customerId), ct);

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create(CreatePaymentInput input, CancellationToken ct)
    {
        var result = await mediator.Send(new CreatePaymentCommand(input.CustomerId, input.Amount, input.DateTimeUtc,
            input.Method, input.ReferenceNumber, input.Notes), ct);
        return CreatedAtAction(nameof(List), new { customerId = result.CustomerId }, result);
    }
}

public sealed record CreatePaymentInput(string CustomerId, decimal Amount, DateTime? DateTimeUtc,
    PaymentMethod Method, string? ReferenceNumber = null, string? Notes = null);
