using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<EmployeeDto> Get(CancellationToken ct) => mediator.Send(new GetMyProfileQuery(), ct);

    [HttpPut]
    public Task<EmployeeDto> Update(UpdateMyProfileCommand command, CancellationToken ct) => mediator.Send(command, ct);
}
