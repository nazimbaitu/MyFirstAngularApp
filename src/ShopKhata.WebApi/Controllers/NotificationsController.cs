using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<NotificationDto>> List(CancellationToken ct) => mediator.Send(new GetNotificationsQuery(), ct);

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct) =>
        await mediator.Send(new MarkNotificationReadCommand(id), ct) ? NoContent() : NotFound();
}
