using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;
using ShopKhata.Domain.Enums;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/employees")]
public sealed class EmployeesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<EmployeeDto>> List(CancellationToken ct) => mediator.Send(new GetEmployeesQuery(), ct);

    [Authorize(Roles = "Owner")]
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeInput input, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateEmployeeCommand(input.Name, input.UserName, input.Mobile, input.Role, input.Password), ct);
        return CreatedAtAction(nameof(List), result);
    }

    [Authorize(Roles = "Owner")]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, RecordStatus status, CancellationToken ct) =>
        await mediator.Send(new SetEmployeeStatusCommand(id, status), ct) ? NoContent() : NotFound();
}

public sealed record CreateEmployeeInput(string Name, string UserName, string? Mobile, string Password, EmployeeRole Role = EmployeeRole.Cashier);
