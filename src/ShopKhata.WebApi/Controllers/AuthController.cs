using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IMediator mediator) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType<AuthDto>(StatusCodes.Status200OK)]
    public Task<AuthDto> Login(LoginCommand command, CancellationToken ct) => mediator.Send(command, ct);
}
