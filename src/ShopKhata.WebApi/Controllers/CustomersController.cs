using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;
using ShopKhata.Domain.Enums;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/customers")]
public sealed class CustomersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<CustomerDto>> List(CancellationToken ct) => mediator.Send(new GetCustomersQuery(), ct);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> Get(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCustomerQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(CustomerInput input, CancellationToken ct)
    {
        var result = await mediator.Send(new SaveCustomerCommand(null, input.Name, input.Mobile, input.Address, input.OpeningBalance, input.Notes), ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public Task<CustomerDto> Update(Guid id, CustomerInput input, CancellationToken ct) =>
        mediator.Send(new SaveCustomerCommand(id, input.Name, input.Mobile, input.Address, input.OpeningBalance, input.Notes), ct);

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, RecordStatus status, CancellationToken ct) =>
        await mediator.Send(new SetCustomerStatusCommand(id, status), ct) ? NoContent() : NotFound();
}

public sealed record CustomerInput(string Name, string Mobile, string? Address, decimal OpeningBalance = 0, string? Notes = null);
