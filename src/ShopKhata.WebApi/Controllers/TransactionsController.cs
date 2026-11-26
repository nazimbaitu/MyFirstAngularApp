using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions")]
public sealed class TransactionsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<TransactionDto>> List([FromQuery] Guid? customerId, [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to, CancellationToken ct) => mediator.Send(new GetTransactionsQuery(customerId, from, to), ct);

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(CreateTransactionInput input, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateTransactionCommand(input.CustomerId, input.DateTimeUtc, input.Items, input.Notes), ct);
        return CreatedAtAction(nameof(List), new { customerId = result.CustomerId }, result);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct) =>
        await mediator.Send(new CancelTransactionCommand(id), ct) ? NoContent() : NotFound();
}

public sealed record CreateTransactionInput(Guid CustomerId, DateTime? DateTimeUtc,
    IReadOnlyList<TransactionItemDto> Items, string? Notes = null);
