using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/reports")]
public sealed class ReportsController(IMediator mediator) : ControllerBase
{
    [HttpGet("daily")]
    public Task<ReportSummaryDto> Daily([FromQuery] DateOnly? date, CancellationToken ct) =>
        mediator.Send(new GetDailySummaryQuery(date), ct);

    [HttpGet("monthly")]
    public Task<ReportSummaryDto> Monthly([FromQuery] int? year, [FromQuery] int? month, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        return mediator.Send(new GetMonthlySummaryQuery(year ?? now.Year, month ?? now.Month), ct);
    }

    [HttpGet("outstanding")]
    public Task<IReadOnlyList<OutstandingDto>> Outstanding(CancellationToken ct) =>
        mediator.Send(new GetOutstandingQuery(), ct);
}
