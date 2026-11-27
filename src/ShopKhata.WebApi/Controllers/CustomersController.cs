using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using ShopKhata.Application.Contracts;
using ShopKhata.Application.Features;
using ShopKhata.Domain.Enums;
using System.Text.RegularExpressions;

namespace ShopKhata.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/customers")]
public sealed class CustomersController(IMediator mediator, IWebHostEnvironment environment,
    ILogger<CustomersController> logger) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<CustomerDto>> List(CancellationToken ct) => mediator.Send(new GetCustomersQuery(), ct);

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDetailDto>> Get(string id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCustomerQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(CustomerInput input, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateCustomerCommand(input.Name, input.Mobile, input.SecondaryMobile,
            input.AdditionalMobile, input.Address, input.OpeningBalance, input.Notes), ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public Task<CustomerDto> Update(string id, CustomerInput input, CancellationToken ct) =>
        mediator.Send(new UpdateCustomerCommand(id, input.Name, input.Mobile, input.SecondaryMobile,
            input.AdditionalMobile, input.Address, input.OpeningBalance, input.Notes), ct);

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> SetStatus(string id, RecordStatus status, CancellationToken ct) =>
        await mediator.Send(new SetCustomerStatusCommand(id, status), ct) ? NoContent() : NotFound();

    [HttpPost("{id}/photo")]
    [RequestSizeLimit(3 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CustomerPhotoUploadResult>> UploadPhoto(string id, [FromForm] IFormFile? file,
        CancellationToken ct)
    {
        if (!Regex.IsMatch(id, "^NK[0-9]{6,}$", RegexOptions.CultureInvariant))
            return BadRequest(new ProblemDetails { Title = "Invalid customer ID." });
        if (file is null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "Choose a photo to upload." });
        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new ProblemDetails { Title = "Photo must be 2 MB or smaller." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not (".jpg" or ".jpeg" or ".png" or ".webp"))
            return BadRequest(new ProblemDetails { Title = "Photo must be a JPG, JPEG, PNG, or WEBP file." });

        var customer = await mediator.Send(new GetCustomerQuery(id), ct);
        if (customer is null) return NotFound();

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var uploadDirectory = Path.Combine(webRoot, "uploads", "customers");
        Directory.CreateDirectory(uploadDirectory);
        var destination = Path.Combine(uploadDirectory, id + extension);
        var temporary = Path.Combine(uploadDirectory, $".{id}.{Guid.NewGuid():N}.tmp");
        var backup = destination + $".{Guid.NewGuid():N}.bak";
        var hadExistingPhoto = System.IO.File.Exists(destination);

        try
        {
            await using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                await file.CopyToAsync(stream, ct);
            if (hadExistingPhoto) System.IO.File.Move(destination, backup);
            System.IO.File.Move(temporary, destination);
            var photoUrl = $"/uploads/customers/{id}{extension}";
            var updated = await mediator.Send(new UpdateCustomerPhotoCommand(id, photoUrl), ct);
            if (!updated) throw new KeyNotFoundException("Customer not found.");
        }
        catch
        {
            if (System.IO.File.Exists(destination)) System.IO.File.Delete(destination);
            if (hadExistingPhoto && System.IO.File.Exists(backup)) System.IO.File.Move(backup, destination);
            if (System.IO.File.Exists(temporary)) System.IO.File.Delete(temporary);
            throw;
        }

        if (hadExistingPhoto)
        {
            try { System.IO.File.Delete(backup); }
            catch (IOException exception) { logger.LogWarning(exception, "Could not remove the previous customer photo backup."); }
            catch (UnauthorizedAccessException exception) { logger.LogWarning(exception, "Could not remove the previous customer photo backup."); }
        }
        return Ok(new CustomerPhotoUploadResult($"/uploads/customers/{id}{extension}"));
    }
}

public sealed record CustomerInput(string Name, string Mobile, string? SecondaryMobile = null,
    string? AdditionalMobile = null, string? Address = null, decimal OpeningBalance = 0, string? Notes = null);
public sealed record CustomerPhotoUploadResult(string PhotoUrl);
