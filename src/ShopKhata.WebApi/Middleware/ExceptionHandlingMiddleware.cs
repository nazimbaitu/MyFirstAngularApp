using Microsoft.AspNetCore.Mvc;
using ShopKhata.Domain.Common;

namespace ShopKhata.WebApi.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try { await next(context); }
        catch (Exception exception)
        {
            var status = exception switch
            {
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                KeyNotFoundException => StatusCodes.Status404NotFound,
                DomainException => StatusCodes.Status400BadRequest,
                ArgumentException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };
            if (status == StatusCodes.Status500InternalServerError)
                logger.LogError(exception, "Unhandled request exception.");
            context.Response.StatusCode = status;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = status,
                Title = status == 500 ? "An unexpected error occurred." : exception.Message,
                Detail = status == 500 ? null : exception.Message,
                Instance = context.Request.Path
            });
        }
    }
}
