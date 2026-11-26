using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/settings")]
public sealed class SettingsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<ShopSettingsDto> Get(CancellationToken ct) => mediator.Send(new GetShopSettingsQuery(), ct);

    [HttpPut]
    public Task<ShopSettingsDto> Update(UpdateShopSettingsCommand command, CancellationToken ct) =>
        mediator.Send(command, ct);
}
